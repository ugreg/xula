package com.example.myapplication.presentation

import android.content.Context
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material.Chip // Good for list items on Wear
import androidx.wear.compose.material.ChipDefaults
import androidx.wear.compose.material.CircularProgressIndicator // For loading state
import androidx.wear.compose.material.ListHeader
import androidx.wear.compose.material.ScalingLazyColumn
import androidx.wear.compose.material.Text
import androidx.wear.compose.material.items
import com.example.myapplication.R // Your R file
import java.lang.reflect.Field


// Data class for audio files (already defined above, ensure it's accessible)
// data class RawAudioFile(val name: String, val resourceId: Int)

// Helper function getRawAudioFiles (already defined above, ensure it's accessible)
// fun getRawAudioFiles(context: Context): List<RawAudioFile> { ... }


@Composable
fun AudioSelectionScreen(
    onAudioSelected: (resourceId: Int, audioName: String) -> Unit // Callback when an audio file is picked
) {
    val context = LocalContext.current
    var audioFiles by remember { mutableStateOf<List<RawAudioFile>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }

    // Load the audio files when the composable enters composition
    LaunchedEffect(Unit) {
        isLoading = true
        audioFiles = getRawAudioFiles(context)
        isLoading = false
    }

    if (isLoading) {
        CircularProgressIndicator(modifier = Modifier.fillMaxSize()) // Show loading indicator
    } else if (audioFiles.isEmpty()) {
        Text(
            text = "No audio files found in res/raw.",
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            textAlign = TextAlign.Center
        )
    } else {
        ScalingLazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(top = 20.dp, bottom = 20.dp, start = 8.dp, end = 8.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            item {
                ListHeader {
                    Text("Select Audio Track")
                }
            }
            items(audioFiles) { audioFile ->
                Chip(
                    onClick = { onAudioSelected(audioFile.resourceId, audioFile.name) },
                    label = { Text(audioFile.name) },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ChipDefaults.primaryChipColors()
                )
            }
        }
    }
}