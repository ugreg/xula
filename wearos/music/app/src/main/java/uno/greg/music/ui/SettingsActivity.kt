package uno.greg.music.ui

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.wear.widget.WearableLinearLayoutManager
import uno.greg.music.R
import uno.greg.music.common.CustomScrollingLayoutCallback
import uno.greg.music.databinding.ActivityFilesBinding
import uno.greg.music.model.SettingsItem
import uno.greg.music.model.SettingsItemType
import uno.greg.music.ui.adapter.SettingsAdapter

class SettingsActivity : AppCompatActivity() {
    private lateinit var adapter: SettingsAdapter
    private lateinit var binding: ActivityFilesBinding
    var themeWasSelected: Int? = null

    override fun onResume() {
        super.onResume()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setTheme(R.style.TealTheme)
        themeWasSelected = R.style.TealTheme

        binding = ActivityFilesBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val settingsList = listOf(
            SettingsItem(SettingsItemType.HEADER),
            SettingsItem(SettingsItemType.WEB, url = "https://github.com/ugreg"),
            SettingsItem(SettingsItemType.SETTINGS),
            SettingsItem(SettingsItemType.TRANSFER),
            SettingsItem(SettingsItemType.FOOTER)
        )

        adapter = SettingsAdapter(this, settingsList)

        binding.recyclerView.adapter = adapter

        binding.recyclerView.layoutManager = WearableLinearLayoutManager(this, CustomScrollingLayoutCallback())
        binding.recyclerView.requestFocus()
    }
}
