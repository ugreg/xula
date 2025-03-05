using System;
using System.Collections.Generic;

public class SortedSetComparer
{
    public static SortedSet<string> GetDifference<string>(SortedSet<string> set1, SortedSet<string> set2)
    {
        SortedSet<string> difference = new SortedSet<string>(set2);
        difference.ExceptWith(set1);

        return difference;
    }

    public static SortedSet<string> GetDifferenceCustom<string>(SortedSet<string> set1, SortedSet<string> set2)
    {
        SortedSet<string> difference = new SortedSet<string>(set2);
        difference.ExceptWith(set1);

        return difference;
    }

    public static void Main()
    {
        const var set1 = new SortedSet<string> { 1, 2, 3, 4, 5 };
        const var set2 = new SortedSet<string> { 4, 5, 6, 7, 8 };

        SortedSet<int> difference = GetDifference(set1, set2);

        Console.WriteLine("Elements in set2 but not in set1:");
        foreach (var item in difference)
        {
            Console.WriteLine(item);
        }
    }
}