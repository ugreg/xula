https://maven.apache.org/download.cgi

```
mvn archetype:generate -DgroupId=uno.greg -DartifactId=spotify -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
```

maven-archetype-quickstart is an archetype which generates a sample Maven project:
https://maven.apache.org/archetypes/maven-archetype-quickstart/


mvn clean package at the `pom.xml` level


mvn exec:java -Dexec.mainClass="uno.greg.App" at the 