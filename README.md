# Node XSLT Dynamic (JSON + multipart + HTML tester)

Tahle služba provede XSLT transformaci pro **libovolné** XSLT a XML:
- `POST /transform` — JSON `{ xml, xslt }`
- `POST /transform-upload` — `multipart/form-data` se soubory `xml` a `xslt`
- `GET /` — jednoduchá HTML stránka s formulářem na testování

## Lokální spuštění
```bash
npm i
npm start
# otevři http://localhost:3000
```

## Příklady volání
### JSON
```bash
curl -X POST http://localhost:3000/transform \
  -H "Content-Type: application/json" \
  --data '{ "xml":"<root><message>Ahoj</message></root>", "xslt":"<?xml version=\"1.0\"?><xsl:stylesheet xmlns:xsl=\"http://www.w3.org/1999/XSL/Transform\" version=\"3.0\"><xsl:output method=\"html\"/><xsl:template match=\"/\"><html><body><h1><xsl:value-of select=\"/*/message\"/></h1></body></html></xsl:template></xsl:stylesheet>" }'
```

### multipart/form-data
```bash
curl -X POST http://localhost:3000/transform-upload \
  -F "xml=@sample.xml;type=application/xml" \
  -F "xslt=@template.xslt;type=application/xml"
```

## Deploy na Render.com
- **Language:** Node
- **Build Command:** `npm ci && npm run render-build`
- **Start Command:** `npm start`
- Potom otevři `/` URL a vyzkoušej tester.

## Poznámky / limity
- Kompilace XSLT -> SEF probíhá **při každém requestu** (univerzální, ale pomalejší). Pro výkon lze přidat cache podle hash XSLT.
- Limit velikosti těla je v kódu 10 MB; uprav dle potřeby.
- Vstupní `Content-Type` pro JSON endpoint musí být `application/json`.
