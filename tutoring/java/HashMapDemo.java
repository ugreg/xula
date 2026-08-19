import java.util.HashMap;

public class HashMapDemo {
    public static void main(String[] args) {
        HashMap<String, Integer> hashMap = new HashMap<>();

        System.out.println("==========================");
        System.out.println("HashMap Demo");
        System.out.println("==========================");
        System.out.println("Adding Bad Bunny to HashMap");
        hashMap.put("Bad Bunny", 2500000);
        System.out.println("Adding Sabrina to HashMap");
        hashMap.put("Sabrina", 35000);
        System.out.println("Adding Charlie to HashMap");
        hashMap.put("Charlie", 30000);
        System.out.println("Duplicate key Sabrina, unable to add to HashMap");
        hashMap.put("Sabrina", 40);

        System.out.println("Size of the HashMap: " + hashMap.size());

        String searchKey = "Bad Bunny";
        Integer age = hashMap.get(searchKey);
        if (age != null) {
            System.out.println(searchKey + "'s stream count is " + age);
        } else {
            System.out.println(searchKey + " not found in the HashMap.");
        }

        boolean containsKey = hashMap.containsKey("Sabrina");
        if (containsKey) {
            System.out.println("Key 'Sabrina' is present in the HashMap.");
        } else {
            System.out.println("Key 'Sabrina' is not present in the HashMap.");
        }

        String removeKey = "Charlie";
        Integer removedValue = hashMap.remove(removeKey);
        if (removedValue != null) {
            System.out.println(removeKey + " was removed. stream count: " + removedValue);
        } else {
            System.out.println(removeKey + " not found in the HashMap.");
        }

        System.out.println("Elements in the HashMap: ");
        for (String key : hashMap.keySet()) {
            Integer value = hashMap.get(key);
            System.out.println("> " + key + ", streams: " + value + " ");
        }

        hashMap.clear();
        System.out.println("HashMap cleared. Size: " + hashMap.size());
    }
}
