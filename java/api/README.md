# Setup 

Get [maven](https://maven.apache.org/download.cgi).

Setup the project.

```
mvn archetype:generate -DgroupId=uno.greg -DartifactId=spotify -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
```

[maven-archetype-quickstart](https://maven.apache.org/archetypes/maven-archetype-quickstart/) is an archetype which generates a sample Maven project with basic Java folder structure.

Resolve dependencies using `mvn clean package` at the `pom.xml` level

# Run

In the correct folder run this.

```
xula/java/api/spotify> mvn exec:java -Dexec.mainClass="uno.greg.App"
```
