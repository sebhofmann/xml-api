/**
 * @jest-environment jsdom
 */
import {dom2XElement} from "../dist/esm/xml-api.js";



const xml = "<xml><!-- comment -->text<elem attr1='attr2' attr3='attr4'></elem></xml>"

test("parse simple xml", async () => {
    const document = new window.DOMParser().parseFromString(xml, "application/xml");
    const root = document.children.item(0);
    console.log(dom2XElement(root))

});
