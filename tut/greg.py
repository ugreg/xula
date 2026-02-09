good_qualities = {
    "personality": "friendly",
    "mentality": "freethinker",
    "num_kids": 0,
    "is_christian": True,
    "lotions_feet": True,
    "patriarchal": True
}

good_qualities["lotions_feet"] = False
answer = input("Describe your personality in one word")
good_qualities["personality"] = answer

print("The person's personality is", good_qualities["personality"], "and they have this amount of kids", good_qualities["num_kids"])