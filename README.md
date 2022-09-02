# xml-json-api

A simple collection of functions to convert the dom API to simple Javascript Objects vice versa and 
helper functions to use them in modern frontend frameworks.

## Usage

### dom2XElement

**Code:**
``` javascript
import {dom2XElement} from "xml-json-api";

const xml = "<xml>one does not <b>simply</b> convert xml</xml>";
const xmlDocument = new window.DOMParser().parseFromString(xml, "application/xml");
const root = xmlDocument.children.item(0);
const result = dom2XElement(root);

console.log(JSON.stringify(result, null, 2));
```

**Result:**
```json
{
   "type": "Element",
   "content": [
     {
       "type": "Text",
       "text": "one does not "
     },
     {
       "type": "Element",
       "content": [
         {
           "type": "Text",
           "text": "simply"
         }
       ],
       "name": "b"
     },
     {
       "type": "Text",
       "text": " convert xml"
     }
   ],
   "name": "xml"
 }

```