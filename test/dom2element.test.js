/**
 * @jest-environment jsdom
 */
import {dom2XElement} from "../dist/esm/xml-api.js";



const xml = "<xml><!-- comment -->text<elem attr1='attr2' attr3='attr4'></elem><![CDATA[Inhalt]]></xml>"

test("parse simple xml", async () => {
    const document = new window.DOMParser().parseFromString(xml, "application/xml");
    const root = document.children.item(0);
    const result = dom2XElement(root);

    expect(result.type).toBe("Element");
    expect(result.content.length).toBe(4);
    expect(result.content[0].type).toBe("Comment");
    expect(result.content[0].text).toBe(" comment ");
    expect(result.content[1].type).toBe("Text");
    expect(result.content[1].text).toBe("text");
    expect(result.content[2].type).toBe("Element");
    expect(result.content[2].name).toBe("elem");
    expect(result.content[3].type).toBe("CDATA");
    expect(result.content[3].text).toBe("Inhalt");
});
