// need tailwindcss, ace code editor

class MPHtmlEditor {

    constructor(elementNode = document.body)
    {
        this.mainElement = elementNode;
        this.makeEditorTreeBtn(this.mainElement);
    }

    makeEditorTreeBtn(parentNode = this.mainElement)
    {
        if(this.editorTreeBtn) return;
        this.editorTreeBtn = document.createElement('button');
        this.editorTreeBtn.innerHTML = 'ویرایش';
        this.editorTreeBtn.setAttribute('class', 'fixed bottom-4 left-4 px-4 py-2 rounded-lg bg-blue-600 text-white');
        document.body.append(this.editorTreeBtn);
        
        this.editorTreeBtn.onclick = () => {
            this.editorTree = new MPHtmlEditorTree(parentNode);
        };

        // this.editorTreeBtn.click(); // ! uncomment for debug!
    }

    static ObjectToJson(elem)
    {
        
    }

}

class MPHtmlEditorTree {

    constructor(parentNode = document.body)
    {
        this.parentNode = parentNode;
        this.onMainPageClose = () => {}; // could be function
        this.makeMainTreePopup(parentNode);
    }

    makeMainTreePopup(startNode = this.parentNode)
    {
        let content = document.createElement('div');
        content.setAttribute('class', 'w-full flex flex-col');
        this.mainTreeBuilderDfs(startNode, content);
        this.mainPopup = new MPHtmlEditorPopup(content);

        content.parentNode.onclick = (e) => { if(e.target == content.parentNode) this.openNodeUpdateContextMenu(e, startNode); };
    }

    mainTreeBuilderDfs(node, mainContent, level = 0)
    {
        if(level > 0)
        {
            let elem = document.createElement('button');
            elem.setAttribute('class', 'w-full text-sm h-10 border-b px-4 flex items-center justify-start gap-2.5 hover:bg-slate-200 transition');
            let icon = document.createElement('span');
            icon.setAttribute('class', `text-slate-600 pl-[${(level - 1) * 1.4}rem] text-sm`);
            icon.innerHTML = '-';
            let text = document.createElement('p');
            text.setAttribute('class', 'text-slate-600 text-sm');
            text.innerHTML = (node.nodeName == '#text' ? node.nodeName + ' ' + node.nodeValue.substr(0, 20) : node.nodeName);
            elem.append(icon, text);
            mainContent.append(elem);

            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(node);
            selection.removeAllRanges();
            elem.onmouseenter = () => { 
                if(node.nodeName != '#text')
                    node.classList.add('ring-4', 'ring-pink-600'); 
                else
                    selection.addRange(range);
            };
            elem.onmouseleave = () => { 
                if(node.nodeName != '#text')
                    node.classList.remove('ring-4', 'ring-pink-600');
                else
                    selection.removeAllRanges();
            };
            elem.onclick = (e) => { this.openNodeUpdateContextMenu(e, node, elem); };
        }

        let allChilds = [];
        if(node.hasChildNodes()) {
            node.childNodes.forEach((child) => {
                allChilds = [...allChilds, ...this.mainTreeBuilderDfs(child, mainContent, level + 1)];
            });
        }

        allChilds.push(node);
        return allChilds;
    }

    openNodeUpdateContextMenu(event, node, treePageElem = null)
    {
        let contextMenuOptions = [];
        if(treePageElem) {
            contextMenuOptions = [
                {
                    icon: `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21.81 3.94C20.27 7.78 16.41 13 13.18 15.59L11.21 17.17C10.96 17.35 10.71 17.51 10.43 17.62C10.43 17.44 10.42 17.24 10.39 17.05C10.28 16.21 9.90002 15.43 9.23002 14.76C8.55002 14.08 7.72002 13.68 6.87002 13.57C6.67002 13.56 6.47002 13.54 6.27002 13.56C6.38002 13.25 6.55002 12.96 6.76002 12.72L8.32002 10.75C10.9 7.52 16.14 3.64 19.97 2.11C20.56 1.89 21.13 2.05 21.49 2.42C21.87 2.79 22.05 3.36 21.81 3.94Z" class="stroke-slate-400" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M10.43 17.6201C10.43 18.7201 10.01 19.77 9.22003 20.57C8.61003 21.18 7.78003 21.6001 6.79003 21.7301L4.33003 22.0001C2.99003 22.1501 1.84003 21.01 2.00003 19.65L2.27003 17.1901C2.51003 15.0001 4.34003 13.6001 6.28003 13.5601C6.48003 13.5501 6.69003 13.56 6.88003 13.57C7.73003 13.68 8.56003 14.0701 9.24003 14.7601C9.91003 15.4301 10.29 16.21 10.4 17.05C10.41 17.24 10.43 17.4301 10.43 17.6201Z" class="stroke-slate-400" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M14.24 14.47C14.24 11.86 12.12 9.73999 9.51001 9.73999" class="stroke-slate-400" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>                    
                    `,
                    content: 'update',
                    onclick: () => { this.makeUpdaterPopup(node), this.mainPopup.close(); },
                }, 
                {
                    icon: `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 5.98C17.67 5.65 14.32 5.48 10.98 5.48C9 5.48 7.02 5.58 5.04 5.78L3 5.98" class="stroke-slate-400" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M8.5 4.97L8.72 3.66C8.88 2.71 9 2 10.69 2H13.31C15 2 15.13 2.75 15.28 3.67L15.5 4.97" class="stroke-slate-400" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M18.85 9.14L18.2 19.21C18.09 20.78 18 22 15.21 22H8.79C6 22 5.91 20.78 5.8 19.21L5.15 9.14" class="stroke-slate-400" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M10.33 16.5H13.66" class="stroke-slate-400" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M9.5 12.5H14.5" class="stroke-slate-400" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    `,
                    content: 'remove',
                    onclick: () => { node.remove(), treePageElem.remove(); },
                },
                {
                    icon: `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.9999 18H9.32992C6.01992 18 4.65992 15.65 6.31992 12.78L7.65992 10.47L8.99992 8.16C10.6599 5.29 13.3699 5.29 15.0299 8.16L16.3699 10.47L17.7099 12.78C19.3699 15.65 18.0099 18 14.6999 18H11.9999Z" class="stroke-slate-400" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>                    
                    `,
                    content: 'add element on top',
                    onclick: () => { this.makeNewElementPopup(node, 'beforebegin'), this.mainPopup.close(); },
                },
                {
                    icon: `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.0001 6H14.6701C17.9801 6 19.3401 8.35 17.6801 11.22L16.3401 13.53L15.0001 15.84C13.3401 18.71 10.6301 18.71 8.97005 15.84L7.63005 13.53L6.29005 11.22C4.66005 8.35 6.01005 6 9.33005 6H12.0001Z" class="stroke-slate-400" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>                    
                    `,
                    content: 'add element on bottom',
                    onclick: () => { this.makeNewElementPopup(node, 'afterend'), this.mainPopup.close(); },
                }
            ];
        } else {
            contextMenuOptions = [
                {
                    icon: `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.0001 6H14.6701C17.9801 6 19.3401 8.35 17.6801 11.22L16.3401 13.53L15.0001 15.84C13.3401 18.71 10.6301 18.71 8.97005 15.84L7.63005 13.53L6.29005 11.22C4.66005 8.35 6.01005 6 9.33005 6H12.0001Z" class="stroke-slate-400" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>                    
                    `,
                    content: 'add element',
                    onclick: () => { this.makeNewElementPopup(node, 'beforeend'), this.mainPopup.close(); },
                }
            ];
        }

        let contextMenu = new MPHtmlEditorContextMenu(
            contextMenuOptions, 
            event.clientY,
            event.clientX
        );
    }

    mainTreePopupOnClose(func)
    {
        this.mainPopup.onClose = func;
    }

    makeUpdaterPopup(node)
    {
        let nodeUpdaterPart = {
            '#text': 'nodeValue',
            'P': 'innerHTML',
            'A': 'innerHTML',
            'H1': 'innerHTML',
            'H2': 'innerHTML',
            'H3': 'innerHTML',
            'H4': 'innerHTML',
        };

        let content = document.createElement('div');
        content.classList.add(..."w-full flex flex-col gap-1.5 p-4".split(' '));

        if(node.nodeName != '#text') // add attr part
        {
            if(!node.hasAttribute('class'))
                node.setAttribute('class', '');
            if(!node.hasAttribute('id'))
                node.setAttribute('id', '');
            if(!node.hasAttribute('src'))
                node.setAttribute('src', '');
            if(!node.hasAttribute('alt'))
                node.setAttribute('alt', '');
            if(!node.hasAttribute('href'))
                node.setAttribute('href', '');

            Object.keys(node.attributes).forEach((key) => {
                let name = node.attributes[key].name;
                let value = node.attributes[key].value;
                
                let label = document.createElement('p');
                label.classList.add(...'text-sm text-slate-400 px-2'.split(' '));
                label.innerText = name;

                let input = document.createElement('input');
                input.classList.add(...'text-sm w-full rounded-lg bg-slate-200 border py-2 px-4 mb-2 outline-none'.split(' '));
                input.value = value;

                input.onkeyup = () => { node.setAttribute(name, input.value); };

                content.append(label);
                content.append(input);
            });
        }

        if(nodeUpdaterPart[node.nodeName])
        {
            let updateProperty = nodeUpdaterPart[node.nodeName];
            let editorElem = document.createElement('div');
            editorElem.classList.add(...'w-full h-80 rounded-lg text-lg'.split(' '));
            content.append(editorElem);

            let editor = ace.edit(editorElem, {
                mode: "ace/mode/html",
                selectionStyle: "html"
            });

            editor.session.on('change', () => {
                node[updateProperty] = editor.getValue();
            });

            editor.setTheme("ace/theme/twilight");
            editor.setValue(node[updateProperty]);
        }

        let popup = new MPHtmlEditorPopup(content, '5rem', null, '40rem', 'unset');
        popup.onClose = () => { this.makeMainTreePopup() };
    }

    makeNewElementPopup(node, position)
    {
        let content = document.createElement('div');
        content.setAttribute('class', 'relative w-full h-full gap-2.5 p-4 flex flex-col');
        let input = document.createElement('input');
        input.setAttribute('class', 'w-full px-4 py-2 rounded-lg bg-slate-200 text-sm outline-none');
        input.placeholder = 'type tagname...';
        let btn = document.createElement('button');
        btn.setAttribute('class', 'px-4 py-1.5 text-sm text-white bg-blue-600 rounded-lg absolute bottom-4 right-4');
        btn.innerHTML = 'save';
        
        content.append(input, btn);

        btn.onclick = () => {
            try {
                let elem = document.createElement(input.value);
                node.insertAdjacentElement(position, elem);
            }
            catch(e) {
                console.error(e);
            }
            popup.close();
        };
        
        let popup = new MPHtmlEditorPopup(content);
        popup.onClose = () => { this.makeMainTreePopup() };
    }

}

class MPHtmlEditorContextMenu {
    constructor(options, top = null, left = null, closeOnClick = true)
    {
        top ??= 10, left ??= 10;
        this.contextMenu = document.createElement('div');
        this.contextMenu.classList.add(...`bg-white shadow-lg border rounded-lg flex flex-col fixed top-[${top}px] left-[${left}px]`.split(' '));
        options.forEach((option, index) => {
            let item = document.createElement('button');
            item.innerHTML = option.icon ?? '';
            item.innerHTML += option.content;
            item.onclick = option.onclick;
            item.classList.add(...'text-slate-500 text-sm pl-4 pr-8 py-2 flex items-center gap-2 w-full hover:bg-slate-100 transition'.split(' '), ...(option.customClass ?? []));
            if(index != options.length - 1)
                item.classList.add('border-b');
            this.contextMenu.append(item);
        });
        document.body.append(this.contextMenu);

        setTimeout(() => {
            if(closeOnClick)
                this.closeOnClick();
        }, 100);
    }

    closeOnClick()
    {
        document.body.addEventListener('click', () => {
            this.contextMenu?.remove();
        });
    }
}

class MPHtmlEditorPopup {
    constructor(content, top = null, left = null, width = null, height = null)
    {
        top ??= '10rem', left ??= '20rem';
        width ??= '20rem', height ??= '24rem';
        this.onClose = () => {}; // function

        let popup = document.createElement('div');
        this.popup = popup;
        document.body.appendChild(popup);
        popup.setAttribute('class', `flex flex-col item-center h-[${height}] w-[${width}] fixed top-[${top}] left-[${left}] bg-white border rounded-2xl shadow-lg overflow-hidden`);
        
        let popupDragger = document.createElement('div');
        popupDragger.setAttribute('class', 'drag-controller absolute self-center top-2 h-6 w-16 bg-slate-700 rounded-full');
        popup.append(popupDragger);

        let popupClose = document.createElement('button');
        popupClose.setAttribute('class', 'h-6 w-6 bg-slate-700 rounded-lg absolute top-2 right-2');
        popup.append(popupClose);
        popupClose.onclick = () => { this.close(popup) };

        let popupContainer = document.createElement('div');
        popupContainer.setAttribute('class', 'w-full h-full pt-10');
        popup.append(popupContainer);

        let popupContainerInner = document.createElement('div');
        popupContainerInner.setAttribute('class', 'w-full h-full border-t overflow-x-hidden overflow-y-auto');
        popupContainer.append(popupContainerInner);

        popupContainerInner.append(content);

        this.dragElement(popup);
    }

    close(popup = this.popup)
    {
        this.onClose();
        popup.remove();
    }

    dragElement(elmnt) {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        if (elmnt.querySelector('.drag-controller')) {
          // if present, the header is where you move the DIV from:
          elmnt.querySelector('.drag-controller').onmousedown = dragMouseDown;
        } else {
          // otherwise, move the DIV from anywhere inside the DIV:
          elmnt.onmousedown = dragMouseDown;
        }
      
        function dragMouseDown(e) {
          e = e || window.event;
          e.preventDefault();
          // get the mouse cursor position at startup:
          pos3 = e.clientX;
          pos4 = e.clientY;
          document.onmouseup = closeDragElement;
          // call a function whenever the cursor moves:
          document.onmousemove = elementDrag;
        }
      
        function elementDrag(e) {
          e = e || window.event;
          e.preventDefault();
          // calculate the new cursor position:
          pos1 = pos3 - e.clientX;
          pos2 = pos4 - e.clientY;
          pos3 = e.clientX;
          pos4 = e.clientY;
          // set the element's new position:
          elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
          elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }
      
        function closeDragElement() {
          // stop moving when mouse button is released:
          document.onmouseup = null;
          document.onmousemove = null;
        }
    }
}

class MPHtmlEditorNode {

    constructor(obj)
    {
        this.nodeName = null;
        this.attrList = {};
        this.body = [];
        
        if(obj instanceof HTMLElement) {
            this.buildFromHtml(obj);
        } else {
            this.buildFromObject(obj);
        }
    }

    buildFromObject(obj)
    {
        this.nodeName = obj.nodeName;
        this.attrList = obj.attrList ?? [];
        this.body = [];

        if(typeof obj.body != 'undefined')
        {
            obj.body.forEach((item) => {
                if(typeof item == 'string')
                {
                    this.body.push(item);
                }
                else
                {
                    this.body.push(new MPHtmlEditorNode(item));
                }
            });
        }
    }

    buildFromHtml(element)
    {
        this.nodeName = element.nodeName;
        this.attrList = {};
        this.body = [];

        for(let i = 0;i < element.attributes.length;i++) {
            let attr = element.attributes[i];
            this.attrList[attr.nodeName] = attr.nodeValue;
        }

        element.childNodes.forEach((item) => {
            if(item.nodeName == '#text')
            {
                this.body.push(item.nodeValue);
            }
            else
            {
                this.body.push(new MPHtmlEditorNode(item));
            }
        });

    }

    build(parentNode = document.body)
    {
        parentNode.appendChild(this.toHtmlElement());
    }

    toHtmlElement()
    {
        let elem = document.createElement(this.nodeName);
        Object.keys(this.attrList).forEach((key) => elem.setAttribute(key, this.attrList[key]));
        this.body.forEach((item) => {
            if(typeof(item) == 'string')
                elem.innerHTML += item;
            else
                elem.append(item.toHtmlElement());
        });

        return elem;
    }

    toObject()
    {
        let json = {};
        json.nodeName = this.nodeName;
        json.attrList = this.attrList;
        json.body = [];
        this.body.forEach((item) => {
            if(typeof(item) == 'string')
                json.body.push(item);
            else
                json.body.push(item.toObject());
        });

        return json;
    }

    toJson()
    {
        return JSON.stringify(this.toObject());
    }

}
