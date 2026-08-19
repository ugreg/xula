package uno.greg;

import java.util.ArrayList;

class Track {
    private String id;
    private String name;
    private ArrayList<Artist> artists;

    public Track(String id, String name) {
        this.name = name;
        this.id = id;
    }

    public String getId() {
        return this.id;
    }

    public String getName() {
        return this.name;
    }

    public ArrayList<Artist> getArtist() {
        return this.artists;
    }
}
