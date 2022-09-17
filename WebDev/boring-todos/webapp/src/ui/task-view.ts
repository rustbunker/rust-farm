import {BaseHTMLElement, customElement, getFirst, html, OnEvent, onEvent,onHub, first } from 'dom-native';
import {Task, taskMac} from '../model/task-model';

@customElement("task-view")
class TaskView extends BaseHTMLElement {
    #taskInputElement!:TaskInput;
    #taskListElement!:HTMLElement;

    init(){
        let htmlContent: DocumentFragment = html`
            <div></div>
            <div class="container">
                <h3>Gündem</h3>
                <task-input></task-input>
                <task-list>/<task-list>
            </div>
        `;
        [this.#taskInputElement,this.#taskListElement] = getFirst(htmlContent,'task-input','task-list');
        this.append(htmlContent);
        this.refresh();
    }

    async refresh() {
        let task_list:Task[] = await taskMac.getAllTasks();
        //console.log(task_list);
        let htmlContent=document.createDocumentFragment();
        for(const task of task_list){
            const ti=document.createElement('task-item');
            ti.data=task;
            htmlContent.append(ti);
        }

        this.#taskListElement.innerHTML = '';
        this.#taskListElement.append(htmlContent);
    }

    // Yeni bir görev eklendiğinde çalışır
    @onHub('taskHub','Task','create')
    onTaskCreate(data:Task){
        console.log("Yeni görev eklendi");
        this.refresh();
    }

    @onHub('taskHub','Task','update')
    onTaskUpdate(data:Task){
        console.log("Güncelleme");
        this.refresh();
    }
}

@customElement("task-input")
class TaskInput extends BaseHTMLElement {
    #inputEl!: HTMLInputElement;

    init(){
        let htmlContent = html`
            <input type="text" placeholder="Sıkıcı bir görev ekleyebilirsin?"></input>
        `;
        this.#inputEl = getFirst(htmlContent,'input');
        this.append(htmlContent);
    }

    // Kullanıcı title kutusunda enter tuşuna bastığında
    // bir görev eklenmesi için model access coordinator'a çağrı yapılır
    @onEvent('keyup','input')
    onInputKeyup(event:KeyboardEvent){
        if(event.key=="Enter"){
            const title = this.#inputEl.value;
            taskMac.createTask({title});
            this.#inputEl.value='';
        }
    }
}

declare global{
    interface HTMLElementTagNameMap{
        'task-input': TaskInput;
    }
}

@customElement("task-item")
class TaskItem extends BaseHTMLElement {
    #titleLabelEl!: HTMLElement;
    #checkboxEl!: HTMLInputElement;
    #data!: Task;

    set data(data:Task){
        let oldData=this.#data;
        this.#data=Object.freeze(data);
        if (this.isConnected){
            this.refresh(oldData);
        }
    }

    get data(){
        return this.#data
    }

    init(){
        let htmlContent = html`
            <div>
                <input type="checkbox" value="" id="taskState">
                <label>Görev Başlığı Gelecek</label>
                <button type="button" class="btn btn-danger">Sil</button>
            </div>
        `;
        this.#titleLabelEl = getFirst(htmlContent,'label');
        this.#checkboxEl = getFirst(htmlContent,'input');
        this.append(htmlContent);
        this.refresh();
    }

    @onEvent('pointerup','input')
    onCheckTask(event:PointerEvent & OnEvent){
        const taskItem = event.selectTarget.closest("task-item")!;
        let currentState = taskItem.data.state;
        //console.log(`Current State${currentState}`);
        if(currentState=='InProgress'){
           taskMac.updateTask(taskItem.data.id,{state:'Completed'});
        }else if(currentState=='Ready'){
           taskMac.updateTask(taskItem.data.id,{state:'InProgress'});
        }
    }

    refresh(old?:Task){
        const task=this.#data;
        this.#titleLabelEl.textContent=task.title;
        if(task.state=="Completed"){
            this.#titleLabelEl.classList.add(`text-success`);
            this.#checkboxEl.checked=true;
            this.#checkboxEl.disabled=true;
        }else if (task.state=="Ready"){
            this.#titleLabelEl.classList.add(`text-warning`);
        }
        else if (task.state=="InProgress"){
            this.#titleLabelEl.classList.add(`text-important`);
        }
    }
}

declare global{
    interface HTMLElementTagNameMap{
        'task-item': TaskItem;
    }
}

