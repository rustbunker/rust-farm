use crate::schema::{categories, games};
use diesel::prelude::*;
use std::fmt::{Display, Formatter};

#[derive(Debug, Queryable)]
pub struct Category {
    pub id: i32,
    pub title: String,
}

impl Display for Category {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "{} - {}", self.id, self.title)
    }
}

#[derive(Insertable)]
#[diesel(table_name = categories)]
pub struct NewCategory {
    pub title: String,
}

#[derive(Debug, Queryable)]
#[diesel(belongs_to(Category))]
pub struct Game {
    pub id: i32,
    pub category_id: i32,
    pub title: String,
    pub stars: i32,
}

impl Display for Game {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "{} - {} ({}*) Categroy {}",
            self.id, self.title, self.stars, self.category_id
        )
    }
}

#[derive(Insertable)]
#[diesel(table_name = games)]
pub struct UpsertGame {
    pub title: String,
    pub stars: i32,
    pub category_id: i32,
}
