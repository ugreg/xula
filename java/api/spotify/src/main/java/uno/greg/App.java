package uno.greg;

import se.michaelthelin.spotify.SpotifyApi;
import se.michaelthelin.spotify.model_objects.credentials.ClientCredentials;
import se.michaelthelin.spotify.requests.authorization.client_credentials.ClientCredentialsRequest;

import java.io.IOException;
import java.util.ArrayList;
import java.util.concurrent.CompletableFuture;

import okhttp3.*;

import com.google.gson.Gson;

public class App {

    private static final String CLIENT_ID = System.getenv("CLIENT_ID_SPOTIFY");
    private static final String CLIENT_SECRET = System.getenv("CLIENT_SECRET_SPOTIFY");

    private static final String TRACK_ID = "0ElVpg9XIswx3XWs6kUj6a";

    private static final SpotifyApi spotifyApi = new SpotifyApi.Builder()
            .setClientId(CLIENT_ID)
            .setClientSecret(CLIENT_SECRET)
            .build();

    public static void main(String[] args) {
        getTrack();
    }

    public static ClientCredentials Authenticate() {
        final ClientCredentialsRequest clientCredentialsRequest = spotifyApi.clientCredentials().build();
        final CompletableFuture<ClientCredentials> clientCredentialsFuture = clientCredentialsRequest.executeAsync();
        final ClientCredentials clientCredentials = clientCredentialsFuture.join();

        return clientCredentials;
    }
    
    public static void getTrack() {

        final ClientCredentials clientCredentials = Authenticate();

        System.out.println("Expires in: " + clientCredentials.getExpiresIn());
        System.out.println("Preparing to get track");

        try {
            getTrackInfo(clientCredentials.getAccessToken().toString(), TRACK_ID);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static void getTrackInfo(String accessToken, String trackId) throws IOException {
        OkHttpClient client = new OkHttpClient();

        Request request = new Request.Builder()
                .url("https://api.spotify.com/v1/tracks/" + trackId)
                .addHeader("Authorization", "Bearer " + accessToken)
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (response.isSuccessful()) {
                String responseData = response.body().string();
                System.out.println("Raw track Info: " + responseData);
                printFancyBrailleSeperator();
                System.out.println("Cleaning data...");
                printFancyBrailleSeperator();
                System.out.println("Done! Here is the processed tack data...");
                Gson gson = new Gson();
                Track track = gson.fromJson(responseData, Track.class);
                System.out.println("Id: " + track.getId());
                System.out.println("Name: " + track.getName());
                System.out.println("\nGetting artist information...");
                ArrayList<Artist> artists = track.getArtist();
                for (int i = 0; i < artists.size(); i++) {
                    System.out.println("Id: " + artists.get(i).getId());
                    System.out.println("Name: " + artists.get(i).getName());
                }
            } else {
                throw new IOException("Unexpected code " + response);
            }
        }
    }

    public static void printFancyBrailleSeperator() {
        System.out.println('\n');
        System.out.println("⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿");
        System.out.println("⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿");
        System.out.println("⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿");
        System.out.println('\n');
    }
}
