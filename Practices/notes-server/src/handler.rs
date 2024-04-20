use crate::cache::{update_cache_if_needed, NotesCache};
use crate::entity::{Note, NoteForm};
use crate::utility::get_file_path;
use handlebars::Handlebars;
use log::{error, info};
use rand::prelude::SliceRandom;
use serde_json::json;
use std::fs;
use std::sync::Arc;
use warp::http::{Response, StatusCode};
use warp::reject::Reject;
use warp::{reject, Rejection, Reply};

#[derive(Debug)]
struct NoteError(String);

impl Reject for NoteError {}
pub struct Handler {}

impl Handler {
    pub async fn index_handler<'a>(
        handlebars: Arc<Handlebars<'a>>,
    ) -> Result<impl Reply, Rejection> {
        let cached_notes = Self::get_notes_from_cache().await?;
        let note = cached_notes.notes.choose(&mut rand::thread_rng());
        let rendered = match handlebars.render("index", &note) {
            Ok(rendered) => rendered,
            Err(_) => return Err(reject::not_found()),
        };

        Ok(Response::builder()
            .header("Content-Type", "text/html; charset=utf-8")
            .body(rendered)
            .unwrap())
    }
    pub async fn note_form_handler<'a>(
        handlebars: Arc<Handlebars<'a>>,
    ) -> Result<impl Reply, Rejection> {
        let rendered = handlebars
            .render("noteForm", &{})
            .map_err(|_| reject::not_found())?;

        Ok(Response::builder()
            .header("Content-Type", "text/html; charset=utf-8")
            .body(rendered)
            .unwrap())
    }
    pub async fn add_note_handler(note_data: NoteForm) -> Result<impl Reply, Rejection> {
        let path = get_file_path("notes.json");
        let notes_file_content = fs::read_to_string(path).unwrap_or_else(|_| "[]".to_string());
        let mut notes: Vec<Note> =
            serde_json::from_str(&notes_file_content).unwrap_or_else(|_| vec![]);
        let new_note = Note {
            id: notes.len() + 1,
            title: note_data.title,
            body: note_data.body,
            publisher: note_data.publisher,
            author: note_data.author,
            media_type: note_data.media_type,
            year: note_data.year,
            month: note_data.month,
            day: note_data.day,
            externals: Option::from(note_data.externals),
        };

        notes.push(new_note);

        let path = get_file_path("notes.json");
        match fs::write(path, serde_json::to_string(&notes).unwrap()) {
            Ok(_) => {
                info!("New note has been added.");
                Ok(warp::reply::with_status(
                    "Note successfully added!",
                    StatusCode::CREATED,
                ))
            }
            Err(e) => {
                let note_error = NoteError("Failed to write to file".to_string());
                error!("{}.{}", note_error.0, e);
                Err(reject::custom(note_error))
            }
        }
    }
    pub async fn get_all_handler<'a>(
        handlebars: Arc<Handlebars<'a>>,
    ) -> Result<impl Reply, Rejection> {
        let cached_notes = Self::get_notes_from_cache().await?;
        let data = serde_json::json!({ "notes": &cached_notes.notes });

        let rendered = match handlebars.render("list", &data) {
            Ok(rendered) => rendered,
            Err(e) => {
                error!("{}", e);
                return Err(reject::not_found());
            }
        };

        Ok(Response::builder()
            .header("Content-Type", "text/html; charset=utf-8")
            .body(rendered)
            .unwrap())
    }
    pub async fn get_by_id(
        id: usize,
        handlebars: Arc<Handlebars<'static>>,
    ) -> Result<impl Reply, Rejection> {
        info!("Requested note id is {}", id);

        let cached_notes = Self::get_notes_from_cache().await?;
        let note = cached_notes.notes.iter().find(|n| n.id == id);

        match note {
            Some(note) => {
                let rendered = match handlebars.render("detail", &note) {
                    Ok(rendered) => rendered,
                    Err(e) => {
                        error!("{}", e);
                        return Err(reject::not_found());
                    }
                };

                Ok(Response::builder()
                    .header("Content-Type", "text/html; charset=utf-8")
                    .body(rendered)
                    .unwrap())
            }
            None => {
                let data = json!({
                    "title": "Hata",
                    "message": "Aranan not bilgisi bulunamadı."
                });
                let rendered = handlebars.render("error", &data).unwrap_or_else(|_| {
                    "<h1>500 Internal Server Error</h1><p>Hata sayfası render edilemedi.</p>"
                        .to_string()
                });

                Ok(Response::builder()
                    .header("Content-Type", "text/html; charset=utf-8")
                    .body(rendered)
                    .unwrap())
            }
        }
    }
    async fn get_notes_from_cache() -> Result<Arc<NotesCache>, Rejection> {
        let cache = update_cache_if_needed().await;
        let locked_cache = cache.lock().await;
        let cached_notes = locked_cache.as_ref().ok_or_else(|| {
            let note_error = NoteError("Failed to retrieve notes from cache".to_string());
            error!("{}", note_error.0);
            reject::custom(note_error)
        })?;
        Ok(Arc::from(cached_notes.clone()))
    }
}
