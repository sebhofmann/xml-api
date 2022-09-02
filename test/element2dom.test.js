/**
 * @jest-environment jsdom
 */
const {dom2XElement, XElement2Dom} = require("../dist/XmlApi.js");

const xml = "<xml><!-- comment -->text<elem attr1='attr2' attr3='attr4'></elem></xml>"

test("parse simple xml", async () => {
    const document = new window.DOMParser().parseFromString(xml, "application/xml");
    const root = document.children.item(0);
    console.log(XElement2Dom(dom2XElement(root)).outerHTML);
});
