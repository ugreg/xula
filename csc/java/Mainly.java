import java.util.SortedSet;
import java.util.TreeSet;

public class SortedSetComparison {

    public static <T> SortedSet<T> except(SortedSet<T> set1, SortedSet<T> set2) {
        SortedSet<T> result = new TreeSet<>(set2);
        result.removeAll(set1);
        return result;
    }

    public static void main(String[] args) {
        SortedSet<Integer> set1 = new TreeSet<>();
        set1.add(1);
        set1.add(2);
        set1.add(3);

        SortedSet<Integer> set2 = new TreeSet<>();
        set2.add(2);
        set2.add(3);
        set2.add(4);
        set2.add(5);

        SortedSet<Integer> result = except(set1, set2);
        System.out.println("Elements in set2 but not in set1: " + result);
    }
}
