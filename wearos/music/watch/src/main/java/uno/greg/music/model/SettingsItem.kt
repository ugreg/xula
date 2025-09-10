package uno.greg.music.model

enum class SettingsItemType {
    HEADER,
    WEB,
    SETTINGS,
    TRANSFER,
    FOOTER
}

data class SettingsItem(val type: SettingsItemType, val url: String? = null)