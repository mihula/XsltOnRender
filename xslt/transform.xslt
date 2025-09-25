<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="3.0">
  <xsl:output method="html" indent="yes"/>
  <xsl:template match="/">
    <html><body>
      <h1>Hello from XSLT 3.0 on Node</h1>
      <p>Input root name: <xsl:value-of select="name(/*)"/></p>
      <p>Message: <xsl:value-of select="/*/message"/></p>
    </body></html>
  </xsl:template>
</xsl:stylesheet>
