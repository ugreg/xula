package uno.greg.music.model

import android.content.Context
import uno.greg.music.R
import java.lang.reflect.Field

data class RawAudioFile(
    val name: String, // User-friendly name (e.g., "song_title")
    val resourceId: Int
)

fun getRawAudioFiles(context: Context): List<RawAudioFile> {
    val rawAudioFiles = mutableListOf<RawAudioFile>()
    val rawClass = R.raw::class.java // Get the R.raw class
    val fields: Array<Field> = rawClass.declaredFields

    for (field in fields) {
        try {
            // We'll assume all files in R.raw are potential audio files
            // You could add more specific filtering here if needed, e.g.,
            // if (field.name.startsWith("audio_") || field.name.endsWith("_track"))
            // For simplicity, we list all. The resource name itself is used.
            val resourceId = field.getInt(null) // pass null for static fields
            val resourceName = field.name // This will be like "myaudio", "another_song"

            // You might want to format the name for display (e.g., replace underscores)
            val displayName = resourceName.replace("_", " ").replaceFirstChar {
                if (it.isLowerCase()) it.titlecase() else it.toString()
            }
            rawAudioFiles.add(RawAudioFile(displayName, resourceId))
        } catch (e: Exception) {
            // Handle exceptions (e.g., IllegalAccessException, IllegalArgumentException)
            e.printStackTrace()
        }
    }
    return rawAudioFiles.sortedBy { it.name } // Sort alphabetically
}