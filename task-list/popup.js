// 设置存储数据格式
let _GLOBAL = localStorage && localStorage['taskTodo']
    ? JSON.parse(localStorage['taskTodo'])
    : {
        TASKLIST: [],
        SHOW: 'all',    // 'all', 'done', 'todo', 'remove'
        INPUT_TXT: ''
    };
// 初始化本地存储数据
sortTaskList();
saveInStorage();
// 渲染基础节点
document.querySelector('.container').innerHTML = `
<div class="task-list">
    <!-- 事务列表 -->
    <div class="task-list-todo"></div>
    <!-- 新增事务 -->
    <div class="task-item task-input">
        <button class="icon task-input-add"></button>
        <textarea rows="1" placeholder="输入待办事务..." class="task-item-text" id="task-input">${ _GLOBAL.INPUT_TXT || '' }</textarea>
    </div>
</div>
<!-- 事务列表操作 -->
<div class="task-action" id="task-action">
    <button class="icon task-all ${ _GLOBAL.SHOW === 'all' ? 'selected' : '' }"></button>
    <button class="icon task-todo ${ _GLOBAL.SHOW === 'todo' ? 'selected' : '' }"></button>
    <button class="icon task-done ${ _GLOBAL.SHOW === 'done' ? 'selected' : '' }"></button>
    <button class="icon task-cycle ${ _GLOBAL.SHOW === 'remove' ? 'selected' : '' }"></button>
</div>`;
// 基础节点操作
const taskInput = document.querySelector('#task-input');
const taskInputAdd = document.querySelector('.task-input-add');

const taskAction = document.querySelector('#task-action');
const showAll = document.querySelector('.task-all');
const showTodo = document.querySelector('.task-todo');
const showDone = document.querySelector('.task-done');
const showCycle = document.querySelector('.task-cycle');

const saveButton = document.createElement('button');
saveButton.className = 'icon task-button-add';
taskAction.append(saveButton);
// 输入完成存储输入内容
taskInput.addEventListener('keyup', (e) => {
    saveButton.style.display = e.target.value.trim() === '' ? 'none' : 'block';
    _GLOBAL.INPUT_TXT = e.target.value.trim();
    saveInStorage();
});
// 回车添加到task list中
taskInput.addEventListener('keydown', (e) => {
    e.target.value = e.target.value.trim();
    if (e.keyCode == 13 && e.target.value.trim() !== '') {
        saveButton.click();
        return false;
    }
});
// 点击输入框前的按钮添加到task list中
taskInputAdd.onclick = function() {
    if (taskInput.value.trim() !== '') {
        saveButton.click();
    }
};
// 显示所有未删除事务
showAll.onclick = function() {
    if (this.className.indexOf('selected') > -1) return;
    [].slice.apply(document.querySelectorAll('.task-action .selected')).forEach(button => {
        button.className = button.className.replace(/ ?selected/, '');
    });
    this.className += ' selected';
    _GLOBAL.SHOW = 'all';
    sortTaskList();
    saveInStorage();
    renderTaskList();
};
// 仅显示未完成事务
showTodo.onclick = function() {
    if (this.className.indexOf('selected') > -1) return;
    [].slice.apply(document.querySelectorAll('.task-action .selected')).forEach(button => {
        button.className = button.className.replace(/ ?selected/, '');
    });
    this.className += ' selected';
    _GLOBAL.SHOW = 'todo';
    saveInStorage();
    renderTaskList();
};
// 仅显示已完成事务
showDone.onclick = function() {
    if (this.className.indexOf('selected') > -1) return;
    [].slice.apply(document.querySelectorAll('.task-action .selected')).forEach(button => {
        button.className = button.className.replace(/ ?selected/, '');
    });
    this.className += ' selected';
    _GLOBAL.SHOW = 'done';
    saveInStorage();
    renderTaskList();
};
// 仅显示已删除事务
showCycle.onclick = function() {
    if (this.className.indexOf('selected') > -1) return;
    [].slice.apply(document.querySelectorAll('.task-action .selected')).forEach(button => {
        button.className = button.className.replace(/ ?selected/, '');
    });
    this.className += ' selected';
    _GLOBAL.SHOW = 'remove';
    saveInStorage();
    renderTaskList();
};
// 点击saveButton添加到task list中
saveButton.onclick = function() {
    saveButton.style.display = 'none';
    _GLOBAL.TASKLIST.push({
        id: new Date().getTime() + '',
        text: taskInput.value.trim(),
        isDone: false,
        isDelete: false
    });
    // 渲染事务列表
    renderTaskList();
    bindAutoSize();
    setTimeout(() => {
        taskInput.value = '';
        _GLOBAL.INPUT_TXT = '';
        showAll.click();
        saveInStorage();
    }, 0);
};
// 基础节点渲染完成后，渲染本地存储数据
renderTaskList();
bindAutoSize(true);
function bindAutoSize(handleInput = false) {
    document.querySelectorAll('.task-item-text').forEach(textarea => {
        if (!handleInput && textarea.id === 'task-input') return;
        console.log('xx: ', textarea)
        autoSize(textarea);
        textarea.onkeydown = () => {
            autoSize(textarea);
        };

        textarea.onchange = () => {
            if (textarea.id !== 'task-input' && textarea.value.trim() !== '') {
                findTaskById(textarea.parentElement.getAttribute('data-id'))._task.text = textarea.value.trim();
                saveInStorage();
            }
            autoSize(textarea);
        };
        // 失去焦点时没有内容将其删除
        textarea.onblur = () => {
            autoSize(textarea);
            if (textarea.id !== 'task-input' && textarea.value.trim() === '') {
                // 移除节点
                let parent = textarea.parentNode;
                parent.parentNode.removeChild(parent);
                // 删除数据
                let index = findTaskById(parent.getAttribute('data-id'))._index;
                if (index > -1) {
                    _GLOBAL.TASKLIST.splice(index, 1);
                    saveInStorage();
                }
            }
        };
    });
}
function autoSize(el) {
    setTimeout(function() {
        el.style.cssText = 'height: auto;';
        el.style.cssText = `height: ${ el.scrollHeight }px;`;
    }, 0);
}
// 渲染事务节点
function renderTaskList() {
    let taskList = []
    if (_GLOBAL.SHOW === 'remove') {
        showCycle.click();
        taskList = _GLOBAL.TASKLIST.filter(task => task.isDelete)
    }
    else {
        taskList = _GLOBAL.TASKLIST.filter(task => !task.isDelete);
        if (_GLOBAL.SHOW === 'done') {
            taskList = taskList.filter(task => task.isDone)
        }
        else if (_GLOBAL.SHOW === 'todo') {
            taskList = taskList.filter(task => !task.isDone)
        }
    }
    console.log('tasklist: ', taskList)
    let taskListHTML = taskList.map(task => {
        return `<div draggable="true" data-id="${ task.id }" class="task-item ${ task.isDone ? 'done' : '' }">
            <button class="icon task-item-checkbox"></button>
            <textarea rows="1" placeholder="输入待办事务..." class="task-item-text">${ task.text }</textarea>
            <button class="icon task-item-remove"></button>
        </div>`
    });
    document.querySelector('.task-list-todo').innerHTML = taskListHTML.join('');
    // checkbox按钮点击事件
    [].slice.apply(document.querySelectorAll('.task-item-checkbox')).forEach(button => {
        button.onclick = () => {
            let task = findTaskById(button.parentNode.getAttribute('data-id'))._task;
            task.isDone = !task.isDone;
            // 每次操作后都需要更新下本地的存储数据
            saveInStorage();
            if (task.isDone) {
                button.parentNode.className += ' done';
            }
            else {
                button.parentNode.className = button.parentNode.className.replace(/ ?done/, '');
            }
        };
    });
    // 移除事件
    [].slice.apply(document.querySelectorAll('.task-item-remove')).forEach(button => {
        button.onclick = () => {
            let task = findTaskById(button.parentNode.getAttribute('data-id'))._task;
            if (task.isDelete) {
                let index = findTaskById(button.parentNode.getAttribute('data-id'))._index;
                _GLOBAL.TASKLIST.splice(index, 1);
            }
            else {
                task.isDelete = true;
            }
            // 每次操作后都需要更新下本地的存储数据
            saveInStorage();
            renderTaskList();
        }
    });
    // 拖拽事件
    [].slice.apply(document.querySelectorAll('.task-item')).forEach(item => {
        item.ondragstart = function(e) {
            e.dataTransfer.setData('id', item.getAttribute('data-id'));
        };
        item.ondragover = function(e) {
            e.preventDefault();
        };
        item.ondrop = function(e) {
            e.preventDefault();
            let id = e.dataTransfer.getData('id');
            let currentId = item.getAttribute('data-id');
            let el = document.querySelector('.task-item[data-id="' + id + '"]');
            item.parentElement.removeChild(el);
            let insertPos = 0;
            for (let i = 0, list = _GLOBAL.TASKLIST; i < list.length; i++) {
                if (list[i].id === id) {
                    insertPos = 1;
                    break;
                }
                else if (list[i].id === currentId) {
                    insertPos = 0;
                    break;
                }
            }
            item[insertPos === 0 ? 'before' : 'after'](el);
            // 同步本地存储数据
            let task = findTaskById(id);
            _GLOBAL.TASKLIST.splice(task._index, 1);
            let currentIndex = findTaskById(currentId)._index + insertPos;
            if (currentIndex >= _GLOBAL.TASKLIST.length) {
                _GLOBAL.TASKLIST.push(task._task);
            }
            else {
                _GLOBAL.TASKLIST.splice(currentIndex, 0, task._task);
            }
            saveInStorage();
        }
    }); 
}
// 根据id查找事务
function findTaskById(id) {
    let _index = -1;
    let _task = null;
    _GLOBAL.TASKLIST.forEach((task, index) => {
        if (task.id === id) {
            _index = index;
            _task = task;
        }
    });

    return {
        _index,
        _task
    }
}
// 本地存储Tasklist
function saveInStorage() {
    console.log('saveInStorage: ', _GLOBAL)
    if (localStorage) {
        localStorage['taskTodo'] = JSON.stringify(_GLOBAL)
    }
}
// 事务排序
function sortTaskList() {
    _GLOBAL.TASKLIST.sort((a, b) => {
        return !a.isDone && b.isDone ? -1 : 1;
    })
}
