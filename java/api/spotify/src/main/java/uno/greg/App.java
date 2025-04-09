package uno.greg;

import okhttp3.*;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.io.IOException;

public class App {

    private static final String CLIENT_ID = "YOUR_CLIENT_ID";
    private static final String CLIENT_SECRET = "YOUR_CLIENT_SECRET";
    private static final String TRACK_ID = "TRACK_ID";

    public static void main(String[] args) {
        try {
            String accessToken = getAccessToken();
            getTrackInfo(accessToken, TRACK_ID);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static String getAccessToken() throws IOException {
        OkHttpClient client = new OkHttpClient();

        String credentials = Credentials.basic(CLIENT_ID, CLIENT_SECRET);
        RequestBody body = new FormBody.Builder()
                .add("grant_type", "client_credentials")
                .build();

        Request request = new Request.Builder()
                .url("https://accounts.spotify.com/api/token")
                .post(body)
                .addHeader("Authorization", credentials)
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (response.isSuccessful()) {
                JsonObject jsonObject = JsonParser.parseString(response.body().string()).getAsJsonObject();
                return jsonObject.get("access_token").getAsString();
            } else {
                throw new IOException("Unexpected code " + response);
            }
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
                System.out.println("Track Info: " + responseData);
            } else {
                throw new IOException("Unexpected code " + response);
            }
        }
    }
}
