package uno.greg.music.viewmodel

import android.os.Environment
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import uno.greg.music.R
import uno.greg.music.common.Utils
import uno.greg.music.model.Action
import uno.greg.music.model.ActionType
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.io.File

class FileViewModel(savedStateHandle: SavedStateHandle) : ViewModel() {
    private val _files = MutableLiveData<List<File>>()
    val files: LiveData<List<File>> = _files

    private val _currentPath = MutableLiveData<String>()
    val currentPath: LiveData<String> = _currentPath

    init {
        val initialPath = savedStateHandle.get<String>("path") ?: Environment.getExternalStorageDirectory().path
        _currentPath.value = initialPath
        loadFiles(initialPath)
    }

    fun loadFiles(path: String) {

        viewModelScope.launch {
            val directory = File(path)

            if (!directory.exists()) {
                loadFiles(directory.parent ?: Environment.getExternalStorageDirectory().path)
                return@launch
            }

            if (directory.isDirectory) {
                val filesList = directory.listFiles()?.toList() ?: emptyList()

                // Сортировка: сначала папки, потом файлы, и всё по имени
                val sortedFiles = filesList.sortedWith(compareBy<File> { !it.isDirectory }.thenBy { it.name.lowercase() })

                _files.value = sortedFiles
                _currentPath.value = path
            } else {
                _files.value = emptyList()
            }
        }


    }


    fun getAvailableActions(path: String): List<Action> {
        val file = File(path)
        val actions = mutableListOf<Action>()

        if (file.exists()) {
            if (file.isDirectory) {

                if (Utils.clipboard != null && file.isDirectory) {
                    actions.add(
                        Action(R.string.paste, ActionType.PASTE)
                    )
                }

                actions.add(
                    Action(R.string.new_folder, ActionType.NEW_FOLDER)
                )
            }
            if (file.absolutePath != Environment.getExternalStorageDirectory().path){
                actions.add(
                    Action(R.string.copy, ActionType.COPY)
                )
                actions.add(
                    Action(R.string.cut, ActionType.CUT)
                )
                actions.add(
                    Action(R.string.rename, ActionType.RENAME)
                )
                actions.add(
                    Action(R.string.delete, ActionType.DELETE)
                )
            }

        }



        return actions
    }

    fun copyFile(path: String) {
        val file = File(path)
        if (file.exists()) {
            Utils.clipboardIsCut = false
            Utils.clipboard = file
        }
    }

    fun cutFile(path: String) {
        val file = File(path)
        if (file.exists()) {
            Utils.clipboardIsCut = true
            Utils.clipboard = file
        }
    }

    fun pasteFile(destinationPath: String): Boolean {
        Utils.clipboard?.let { file ->
            var destination = File(destinationPath, file.name)

            if (destination.exists()) {
                destination = File(destinationPath, "copy - ${file.name}")
            }

            file.copyRecursively(destination, overwrite = false)

            if (Utils.clipboardIsCut){
                file.deleteRecursively()
            }

            Utils.clipboard = null
            Utils.clipboardIsCut = false
            true
        }
        return false
    }

    fun deleteFile(path: String) {
        val file = File(path)
        loadFiles(file.parent ?: Environment.getExternalStorageDirectory().path)

        if (file.exists()) {
            if (file.isDirectory){
                file.deleteRecursively()
            }else{
                file.delete()
            }
        }
    }

    fun isExists(path: String): Boolean {
        val file = File(path)
        return file.exists()
    }

    fun createFolder(path: String, folderName: String) {
        val folder = File(path, folderName)
        folder.mkdir()
    }

    fun renameFileOrFolder(path: String, newName: String) {
        val file = File(path)
        if (!file.exists()) return

        val parentDir = file.parentFile ?: return
        var newFile = File(parentDir, newName)

        while (newFile.exists()) {
            newFile = File(parentDir, "copy - ${newFile.name}")
        }

        file.renameTo(newFile)
    }

}