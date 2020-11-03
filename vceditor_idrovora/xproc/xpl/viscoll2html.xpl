<?xml version="1.0" encoding="UTF-8"?>
<p:declare-step xmlns:p="http://www.w3.org/ns/xproc"
                xmlns:c="http://www.w3.org/ns/xproc-step"
                xmlns:vc="http://schoenberginstitute.org/schema/collation"
                version="1.0">
  <p:option name="job-dir" required="true"/>
  <p:variable name="css-base" select="'../css/'"/>

  <p:import href="viscoll2svg.xpl"/>
  <p:import href="viscoll2formulas.xpl"/>

  <vc:viscoll2svg>
    <p:with-option name="job-dir" select="$job-dir"/>
  </vc:viscoll2svg>
  <vc:viscoll2formulas>
    <p:with-option name="job-dir" select="$job-dir"/>
  </vc:viscoll2formulas>

  <p:load>
    <p:with-option name="href" select="concat($job-dir,'input.xml')"/>
  </p:load>
  <p:xslt name="preprocessing">
    <p:with-option name="output-base-uri" select="$job-dir"/>
    <p:with-param name="job-base" select="$job-dir"/>
    <p:input port="stylesheet">
      <p:document href="xsl/viscoll2processed.xsl"/>
    </p:input>
  </p:xslt>
  <p:sink/>
  <p:for-each>
    <p:iteration-source>
      <p:pipe step="preprocessing" port="secondary"/>
    </p:iteration-source>
    <p:xslt name="html">
      <p:with-option name="output-base-uri" select="$job-dir"/>
      <p:with-param name="job-base" select="$job-dir"/>
      <p:input port="stylesheet">
        <p:document href="xsl/processed2html.xsl"/>
      </p:input>
    </p:xslt>
    <p:for-each>
      <p:iteration-source>
        <p:pipe step="html" port="secondary"/>
      </p:iteration-source>
      <p:store encoding="utf-8" indent="false" omit-xml-declaration="false">
        <p:with-option name="href" select="p:base-uri()"/>
      </p:store>
    </p:for-each>
  </p:for-each>
</p:declare-step>
