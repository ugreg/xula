import java.util.ArrayList;

public class ArrayDemo {
    public static void print2DArray(int[][] array) {
        System.out.println("Printing 2d array");
        if (array == null || array.length == 0) {
            System.out.println("The array is empty or null.");
            return;
        }

        for (int i = 0; i < array.length; i++) {
            for (int j = 0; j < array[i].length; j++) {
                System.out.print(array[i][j] + " ");
            }
            System.out.println();
        }
    }

    public static void main(String[] args) {
        int[][] sample2DArray = {
                { 1, 2, 3 },
                { 4, 5, 6 },
                { 7, 8, 9 }
        };
        print2DArray(sample2DArray);

        // todo: next session lets read files into an arraylist
        ArrayList<String> oneDList = new ArrayList<>();
        oneDList.add("Hot Pot");
        oneDList.add("Chili");
        oneDList.add("Soooop");
        oneDList.add("Bacon");
    }
}
