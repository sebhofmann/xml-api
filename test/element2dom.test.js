/**
 * @jest-environment jsdom
 */
import {XElement2Dom} from "../dist/esm/xml-json-api.js";


const xml = {
    "type": "Element",
    "content": [
        {"type": "Comment", "text": " comment "},
        {"type": "Text", "text": "text"},
        {"type": "Element",
        "content": [
            {"type": "Attribute", "name": "attr1", "value": "attr2"},
            {"type": "Attribute", "name": "attr3", "value": "attr4"}],
        "name": "elem"
        },
        {"type": "CDATA", "text": "Inhalt"}],
    "name": "xml"
}


test("parse simple xml", async () => {
    const result = XElement2Dom(xml);

    expect(result.nodeType).toBe(1);
    expect(result.childNodes.item(0).nodeType).toBe(8);
    expect(result.childNodes.item(0).textContent).toBe(" comment ");
    expect(result.childNodes.item(1).nodeType).toBe(3);
    expect(result.childNodes.item(1).textContent).toBe("text");
    expect(result.childNodes.item(2).nodeType).toBe(1);
    expect(result.childNodes.item(2).attributes.length).toBe(2);
    expect(result.childNodes.item(3).nodeType).toBe(4);
    expect(result.childNodes.item(3).textContent).toBe("Inhalt");

});
