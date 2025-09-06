package com.example.myapplication.presentation

import android.media.MediaPlayer
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.example.myapplication.R // Assuming your R file is here

@Composable
fun AudioPlayerScreen() {
    val context = LocalContext.current
    var mediaPlayer by remember { mutableStateOf<MediaPlayer?>(null) }
    var isPlaying by remember { mutableStateOf(false) }
    var currentPosition by remember { mutableStateOf(0) } // To store position when pausing
    var audioDuration by remember { mutableStateOf(0) }


    // Function to initialize and prepare MediaPlayer
    fun preparePlayer(resourceId: Int) {
        mediaPlayer?.release() // Release any existing player

        mediaPlayer = MediaPlayer.create(context, resourceId).apply {
            setOnPreparedListener {
                audioDuration = it.duration // Get duration when prepared
                // You could auto-play here if desired: it.start(); isPlaying = true
            }
            setOnCompletionListener {
                isPlaying = false
                currentPosition = 0
                // Optionally: mediaPlayer?.seekTo(0) to allow replaying from start
            }
            setOnErrorListener { mp, what, extra ->
                // Handle errors
                isPlaying = false
                // Log error or show a message
                true // Indicate error was handled
            }
        }
    }

    // Function to play audio
    fun playAudio() {
        mediaPlayer?.let {
            if (!it.isPlaying) {
                if (currentPosition > 0 && currentPosition < it.duration) {
                    it.seekTo(currentPosition)
                }
                it.start()
                isPlaying = true
            }
        }
    }

    // Function to pause audio
    fun pauseAudio() {
        mediaPlayer?.let {
            if (it.isPlaying) {
                it.pause()
                currentPosition = it.currentPosition // Save current position
                isPlaying = false
            }
        }
    }

    // Function to stop and release audio
    fun stopAudio() {
        mediaPlayer?.let {
            if (it.isPlaying) {
                it.stop() // Stop playback
            }
            // Prepare for next playback or release
            try {
                // It's good practice to prepare again if you want to play the same audio
                // or simply reset to allow playing from start
                it.reset() // Resets the MediaPlayer to its uninitialized state.
                // If you want to play the same resource again, you'll need to setDataSource and prepare again.
                // For simplicity, we'll re-initialize with preparePlayer when play is hit again after stop.
                isPlaying = false
                currentPosition = 0
            } catch (e: Exception) {
                // Handle exceptions during reset if any
            }
        }
    }


    // Initialize the player when the composable enters composition
    // Make sure to replace R.raw.myaudio with your actual MP3 file resource ID
    // This will load the audio but not play it immediately.
    DisposableEffect(Unit) {
        // Example: preparePlayer(R.raw.your_audio_file_name_in_raw_folder)
        // For this example, let's assume you have an MP3 named 'myaudio.mp3' in res/raw
        preparePlayer(R.raw.shuffle) // <<--- CHANGE THIS TO YOUR FILE

        onDispose {
            mediaPlayer?.release()
            mediaPlayer = null
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(text = if (isPlaying) "Playing..." else if (mediaPlayer?.isLooping == true && currentPosition == 0) "Ready" else "Paused/Stopped")

        Spacer(modifier = Modifier.height(16.dp))

        Button(onClick = {
            if (mediaPlayer == null || (!mediaPlayer!!.isPlaying && currentPosition == 0)) {
                // If player is null or stopped and reset, prepare it again
                preparePlayer(R.raw.shuffle) // <<--- CHANGE THIS TO YOUR FILE
                mediaPlayer?.setOnPreparedListener {
                    audioDuration = it.duration
                    playAudio() // Play after preparing
                }
            } else {
                playAudio()
            }
        }, enabled = mediaPlayer != null) {
            Text("Play")
        }

        Spacer(modifier = Modifier.height(8.dp))

        Button(onClick = { pauseAudio() }, enabled = isPlaying) {
            Text("Pause")
        }

        Spacer(modifier = Modifier.height(8.dp))

        Button(
            onClick = { stopAudio() },
            enabled = mediaPlayer != null && (isPlaying || currentPosition > 0)
        ) {
            Text("Stop")
        }

        Spacer(modifier = Modifier.height(16.dp))
        Text(text = "Duration: ${formatMillis(audioDuration)}")
        if (isPlaying || currentPosition > 0) {
            // You could add a seek bar here and update currentPosition
            // For simplicity, just displaying current position
            // To get live updates, you'd need a way to poll mediaPlayer.currentPosition
            Text(text = "Current: ${formatMillis(mediaPlayer?.currentPosition ?: currentPosition)}")
        }
    }
}

// Helper function to format milliseconds to MM:SS
fun formatMillis(millis: Int): String {
    val totalSeconds = millis / 1000
    val seconds = totalSeconds % 60
    val minutes = totalSeconds / 60
    return String.format("%02d:%02d", minutes, seconds)
}