<?xml version="1.0" encoding="UTF-8"?>
<p:declare-step xmlns:p="http://www.w3.org/ns/xproc"
                xmlns:c="http://www.w3.org/ns/xproc-step"
                version="1.0">
  <p:option name="job-dir" required="true"/>
  <p:load name="read-from-input">
    <p:with-option name="href" select="concat($job-dir,'input.xml')"/>
  </p:load>
  <p:identity/>
  <p:store name="store-to-output">
    <p:with-option name="href" select="concat($job-dir,'output.xml')"/>
  </p:store>
</p:declare-step>
