// 设置存储数据格式
let _GLOBAL = localStorage && localStorage['fund']
    ? JSON.parse(localStorage['fund'])
    : {
        LIST: [],
        FRESHTIME: '',
        CODE_TXT: ''
    }
saveInStorage();
// 渲染基础节点
document.querySelector('.container').innerHTML = `
<div class="table">
    <div class="table-header">
        <div class="table-cell" style="width: 120px;">基金名称</div>
        <div class="table-cell" style="width: 65px;">基金代码</div>
        <div class="table-cell" style="width: 65px;">单位净值</div>
        <div class="table-cell" style="width: 65px;">今日估值</div>
        <div class="table-cell" style="width: 85px;">今日收益比</div>
        <div class="table-cell" style="width: 100px;">持仓份额</div>
        <div class="table-cell" style="width: 65px;">今日收益</div>
        <div class="table-cell" style="width: 85px;">更新时间</div>
        <div class="table-cell" style="width: 50px;">操作</div>
    </div>
    <div class="table-body"></div>
    <div class="table-footer"></div>
</div>
<div class="fund-input">
    <div class="table-cell">
        <textarea id="fund-code" rows="1" placeholder="基金代码" class="fund-text-input">${ _GLOBAL.CODE_TXT }</textarea>
    </div>
    <div class="table-cell">
        <button id="fund-add" class="fund-add">新增</button>
    </div>
</div>`
// 新增基金
const fundCode = document.querySelector('#fund-code');
const fundAdd = document.querySelector('#fund-add');
// 输入的值只要不清空就保存
fundCode.addEventListener('keyup', (e) => {
    _GLOBAL.CODE_TXT = e.target.value.trim();
    saveInStorage();
});
// 新增基金
fundAdd.onclick = function() {
    if (fundCode.value.trim() !== '') {
        getFundInfo(fundCode.value.trim());
    }
    fundCode.value = '';
    saveInStorage();
}
if (_GLOBAL.LIST.length) {
    for (i = 0, list = _GLOBAL.LIST; i < list.length; i++) {
        getFundInfo(list[i].fundCode);
    }
}
renderFundList();
// 渲染基金节点
function renderFundList() {
    let fundList = _GLOBAL.LIST;
    let total = 0;
    let fundListHTML = fundList.map(fund => {
        total += parseFloat(fund.toadyEarn);
        return `<div class="table-row" data-code="${ fund.fundCode }">
            <div class="table-cell" style="width: 120px;">${ fund.fundName }</div>
            <div class="table-cell" style="width: 65px;">${ fund.fundCode }</div>
            <div class="table-cell" style="width: 65px;">${ fund.unitValue }</div>
            <div class="table-cell" style="width: 65px;font-weight: bold;color: ${ fund.percent < 0 ? 'rgb(54,171,96)' : 'rgb(213,60,40)' };">${ fund.todayValue }</div>
            <div class="table-cell" style="width: 85px;font-weight: bold;color: ${ fund.percent < 0 ? 'rgb(54,171,96)' : 'rgb(213,60,40)' };">${ fund.percent }%</div>
            <div class="table-cell" style="width: 100px;"><textarea rows="1" placeholder="持仓份额" class="fund-text-share">${ fund.share }</textarea></div>
            <div class="table-cell" style="width: 65px;font-weight: bold;color: ${ fund.toadyEarn < 0 ? 'rgb(54,171,96)' : 'rgb(213,60,40)' };">￥${ fund.toadyEarn }</div>
            <div class="table-cell" style="width: 85px;">${ fund.freshTime }</div>
            <div class="table-cell" style="width: 50px;"><button class="fund-remove">移除</button></div>
        </div>`
    });
    
    let totalHTML = `<div class="table-row">
        <div class="table-cell" style="width: 120px;color: rgb(213,60,40);">今日总收益</div>
        <div class="table-cell" style="width: 65px;"></div>
        <div class="table-cell" style="width: 65px;"></div>
        <div class="table-cell" style="width: 65px;"></div>
        <div class="table-cell" style="width: 85px;"></div>
        <div class="table-cell" style="width: 100px;"></div>
        <div class="table-cell" style="width: 65px;font-weight: bold;color: ${ total < 0 ? 'rgb(54,171,96)' : 'rgb(213,60,40)' };">￥${ total.toFixed(2) }</div>
        <div class="table-cell" style="width: 85px;">${ _GLOBAL.FRESHTIME }</div>
        <div class="table-cell" style="width: 50px;"></div>
    </div>`
    document.querySelector('.table-body').innerHTML = fundListHTML.join('');
    document.querySelector('.table-footer').innerHTML = totalHTML;
    // 移除事件
    [].slice.apply(document.querySelectorAll('.fund-remove')).forEach(button => {
        button.onclick = () => {
            let index = findFundByCode(button.parentNode.parentNode.getAttribute('data-code'))._index;
            _GLOBAL.LIST.splice(index, 1);
            // 每次操作后更新本地存储
            saveInStorage();
            renderFundList();
        }
    });
    // 持仓份额
    [].slice.apply(document.querySelectorAll('.fund-text-share')).forEach(textarea => {
        textarea.onchange = () => {
            let fundCode = textarea.parentNode.parentNode.getAttribute('data-code');
            let fund = findFundByCode(fundCode)._fund;
            if (textarea.value.trim() !== '') {
                fund.share = textarea.value.trim();
                fund.toadyEarn = (fund.share * fund.unitValue * fund.percent / 100).toFixed(2);
            }
            else {
                fund.share = textarea.value.trim();
                fund.toadyEarn = '0.00';
            }
            saveInStorage();
            renderFundList();
        }
    });
}
// 加载数据
function getFundInfo(fundCode) {
    // 向页面插入script
    const body =document.querySelector('body');
    let scriptEl = document.createElement('script');
    scriptEl.src = `https://fundgz.1234567.com.cn/js/${ fundCode }.js?rt=${ new Date().getTime() }`;
    body.appendChild(scriptEl);
}
// jsonp回调
function jsonpgz(data) {
    let fund = findFundByCode(data.fundcode)._fund;
    if (!fund) {
        let newFund = {};
        newFund.fundCode = data.fundcode;
        newFund.fundName = data.name;
        newFund.unitValue = data.dwjz;
        newFund.todayValue = data.gsz;
        newFund.percent = data.gszzl;
        newFund.share = '0.00';
        newFund.toadyEarn = (fund.share * fund.unitValue * fund.percent / 100).toFixed(2);
        newFund.freshTime = data.gztime;
        _GLOBAL.LIST.push(newFund);
    }
    else {
        fund.fundName = data.name;
        fund.unitValue = data.dwjz;
        fund.todayValue = data.gsz;
        fund.percent = data.gszzl;
        fund.toadyEarn = (fund.share * fund.unitValue * fund.percent / 100).toFixed(2);
        fund.freshTime = data.gztime;
    }
    _GLOBAL.FRESHTIME = formatDate(new Date().getTime(), 'YYYY-mm-dd HH:MM');
    _GLOBAL.CODE_TXT = '';
    saveInStorage();
    renderFundList();
}
// 根据code查找基金
function findFundByCode(code) {
    let _index = -1;
    let _fund = null;
    _GLOBAL.LIST.forEach((fund, index) => {
        if (fund.fundCode === code) {
            _index = index;
            _fund = fund;
        }
    });

    return {
        _index,
        _fund
    };
}
// 本地存储
function saveInStorage() {
    if (localStorage) {
        localStorage['fund'] = JSON.stringify(_GLOBAL);
    }
}
// 事件格式化
function formatDate(time, format) {
	let date = new Date(time)
	let result = null
	let options = {
		"Y+": date.getFullYear().toString(),        // 年
		"m+": (date.getMonth() + 1).toString(),     // 月
		"d+": date.getDate().toString(),            // 日
		"H+": date.getHours().toString(),           // 时
		"M+": date.getMinutes().toString(),         // 分
		"S+": date.getSeconds().toString()          // 秒
	}
	for (let k in options) {
		result = new RegExp("(" + k + ")").exec(format)
		if (result) {
			format = format.replace(result[1], (result[1].length === 1) ? (options[k]) : (options[k].padStart(result[1].length, '0')))
		}
	}
	return format
}