export function XElement2Dom(elem: XElement): Element {
    return convertXNode(elem) as Element;
}

export function dom2XElement(root: Element): XNode {
    return convertNode(root);
}

function getDocument() {
    const document = new window.DOMParser().parseFromString("<xml></xml>", "application/xml")
    return document;
}

function convertXNode(node: XNode): Node {
    switch (node.type) {
        case "Element":
            const xelement = node as XElement;
            const element = getDocument().createElement(xelement.name);

            for (const child of xelement.content) {
                if (child.type == "Attribute") {
                    const attrChild = child as XAttribute;
                    element.setAttribute(attrChild.name, attrChild.value);
                } else {
                    const node = convertXNode(child);
                    element.append(node);
                }
            }
            return element;
        case "CDATA":
            return getDocument().createCDATASection((node as XCDATA).text);
        case "Comment":
            return getDocument().createComment((node as XComment).text);
        case "Text":
            return getDocument().createTextNode((node as XText).text);
        default:
            throw new Error("Unknown node type " + node.type);
    }
}

function convertNode(node: Node): XNode {
    switch (node.nodeType) {
        case node.ELEMENT_NODE:
            const elementNode: XElement = {type: "Element", content: [], name: node.nodeName}
            const attributes = (node as Element).attributes as NamedNodeMap;
            for (let i = 0; i < attributes.length; i++) {
                const attr = attributes.item(i);
                if (attr !== null) {
                    elementNode.content.push(convertNode(attr));
                }
            }
            for (let i = 0; i < node.childNodes.length; i++) {
                const childItem = node.childNodes.item(i);
                if (childItem.nodeType !== 7) {
                    elementNode.content.push(convertNode(childItem));
                }
            }
            return elementNode as XElement;
        case node.ATTRIBUTE_NODE:
            const name = node.nodeName;
            const value = node.nodeValue;
            return {type: "Attribute", name, value} as XAttribute;
        case node.TEXT_NODE: {
            const text = node.textContent;
            return {type: "Text", text} as XText;
        }
        case node.COMMENT_NODE: {
            const text = node.textContent;
            return {type: "Comment", text} as XComment
        }
        case node.CDATA_SECTION_NODE: {
            return {type: "CDATA", text: node.textContent} as XCDATA;
        }
        default:
            throw new Error("Unknown Node Type " + node.nodeType);
    }
}

export interface XAttribute extends XNode {
    name: string;
    value: string;
    type: "Attribute";
}

export interface XCDATA extends XNode {
    text: string;
    type: "CDATA";
}

export interface XComment extends XNode {
    text: string
    type: "Comment";
}

export interface XElement extends XNode {
    name: string,
    content: Array<XNode>,
    type: "Element"
}

export interface XText extends XNode {
    text: string;
    type: "Text" | "CDATA"
}

export interface XNode {
    type: "Element" | "CDATA" | "Attribute" | "Text" | "Comment"
}

export interface XFilter<T extends XNode> {
    (obj: T): boolean;
}

export function findFirstNode(parent: XElement, filterFn: XFilter<XNode>): XNode | null {
    for (const content of parent.content) {
        if (filterFn(content)) {
            return content;
        }
        if (content.type == "Element") {
            const element = findFirstNode(content as XElement, filterFn);
            if (element != null) {
                return element;
            }
        }
    }
    return null;
}

export function findFirstElement(parent: XElement, filterFn: XFilter<XElement>): XElement | null {
    for (const content of parent.content) {
        if (content.type == "Element") {
            const elemContent = content as XElement;
            if (filterFn(elemContent)) {
                return elemContent;
            } else {
                const element = findFirstElement(elemContent, filterFn);
                if (element != null) {
                    return element;
                }
            }
        }
    }
    return null;
}

export function findElement(parent: XElement, filterFn: XFilter<XElement>, result = new Array<XElement>()): Array<XElement> {
    for (const content of parent.content) {
        if (content.type == "Element") {
            const elemContent = content as XElement;
            if (filterFn(elemContent)) {
                result.push(elemContent);
            } else {
                findElement(elemContent, filterFn, result);
            }
        }
    }
    return result;
}

export function flattenElement(parent: XElement | XText) {
    if(parent==null){
        return null;
    }
    const array = new Array<string>();
    flattenElementBuilder(parent, array)
    const result = array.join("");
    //console.log(["FLATTEN", parent, "FLATTEN TO", result])

    return result;

}

function flattenElementBuilder(parent: XElement | XText, builder = new Array<string>()) {
    if (parent.type == "Text") {
        builder.push((parent as XText).text);
    } else if(parent.type=="Element") {
        for (const content of (parent as XElement).content) {
            if (content.type == "Element") {
                flattenElementBuilder(content as XElement, builder);
            } else if (content.type == "Text") {
                builder.push((content as XText).text);
            }
        }
    }
}

export function flattenElementExcept(parent: XElement | XText, filter: XFilter<XElement>) {
    const arr = new Array<string | XElement>()

    flattenElementExceptBuilder(parent, arr, filter);

    return arr;
}

function flattenElementExceptBuilder(parent: XElement | XText, builder = new Array<string | XElement>(), filter: XFilter<XElement>) {
    if (parent.type == "Text") {
        builder.push((parent as XText).text);
    } else {
        for (const content of (parent as XElement).content) {
            if (content.type == "Element") {
                if (filter(content as XElement)) {
                    builder.push(content as XElement);
                } else {
                    flattenElementExceptBuilder(content as XElement, builder, filter);
                }
            } else if (content.type == "Text") {
                builder.push((content as XText).text);
            }
        }
    }
}


export function getAttribute(element: XElement, attrName: string, attrValue?: string) {
    for (let node of element.content) {
        if (node.type == "Attribute") {
            if ((node as XAttribute).name === attrName) {
                if (attrValue == undefined) {
                    return node;
                } else {
                    return (node as XAttribute).value == attrValue ? node : null;
                }
            }
        }
    }
    return null;
}

export function byAttr(attrName: string, attrValue?: string): XFilter<XElement> {
    return (elem) => getAttribute(elem, attrName, attrValue) != null;
}

export function byName(name: string): XFilter<XElement> {
    return (elem) => elem.name === name;
}

export function and<T extends XNode>(...filters: Array<XFilter<T>>) {
    return (elem: T) => {
        for (const filter of filters) {
            if (!filter(elem)) {
                return false;
            }
        }
        return true;
    }
}

export function or<T extends XNode>(...filters: Array<XFilter<T>>) {
    return (elem: T) => {
        for (const filter of filters) {
            if (filter(elem)) {
                return true;
            }
        }
    }
}