my_playlist = { 
    "black pink", 
    "lady gaga", 
    "mj", 
    "louis armstrong", 
    "frank sinatra", 
    "sabrina carpenter" 
}

your_playlist = {
    "system of a down",
    "mj", 
    "louis armstrong", 
    "frank sinatra", 
    256,
    "chappell roan"
}

diff = my_playlist - your_playlist
num_diff = len(diff)

# todo 4u: 
# format this print better
# add some functions
print("Dang man ", num_diff, " of those people I never even heard of.")
print("I really need to check out:", diff)
