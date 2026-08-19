public class SortedSetComparer
{
    public static SortedSet<string> GetDiff(SortedSet<string> set1, SortedSet<string> set2)
    {
        var diff = new SortedSet<string>(set2);
        diff.ExceptWith(set1);

        return diff;
    }

    public static SortedSet<string> GetDiffCustom(SortedSet<string> set1, SortedSet<string> set2)
    {
        var diff = new SortedSet<string>(set2);
        diff.ExceptWith(set1);

        return diff;
    }

    public static void Main()
    {
        var set1 = new SortedSet<string>
        {
            "Black Pink",
            "Lady Gaga",
            "Micheal Jackson",
            "Louis Armstrong",
            "Frank Sinatra",
            "Sabrina Carpenter"
        };

        var set2 = new SortedSet<string>
        {
            "System of a Down",
            "Janet Jackson",
            "Louis Armstrong",
            "Frank Sinatra",
            "Chappell Roan"
        };

        SortedSet<string> diff = GetDiff(set1, set2);

        Console.WriteLine("Elements in set2 but not in set1:");
        foreach (var item in diff)
        {
            Console.WriteLine(item);
        }
    }
}
