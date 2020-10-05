<?xml version="1.0" encoding="UTF-8"?>
<p:declare-step xmlns:p="http://www.w3.org/ns/xproc"
                xmlns:c="http://www.w3.org/ns/xproc-step"
                xmlns:vc="http://schoenberginstitute.org/schema/collation"
                type="vc:viscoll2formulas"
            version="1.0">
  <p:option name="job-dir" required="true"/>
  <p:load name="read-from-input">
    <p:with-option name="href" select="concat($job-dir,'input.xml')"/>
  </p:load>
  <p:validate-with-relax-ng>
    <p:input port="schema">
      <p:document href="rng/viscoll-2.0.rng"/>
    </p:input>
  </p:validate-with-relax-ng>
  <p:xslt name="xslt">
    <p:with-option name="output-base-uri" select="$job-dir"/>
    <p:input port="stylesheet">
      <p:document href="xsl/viscoll2formulas.xsl"/>
    </p:input>
    <p:input port="parameters">
      <p:empty/>
    </p:input>
  </p:xslt>
  <p:sink/>
  <p:for-each>
      <p:iteration-source>
         <p:pipe step="xslt" port="secondary"/>
      </p:iteration-source>
      <p:store>
         <p:with-option name="href" select="p:base-uri()"/>
      </p:store>
   </p:for-each>
</p:declare-step>
