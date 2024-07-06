import numpy as np

mat = np.random.randint(0, 10, (5,5))
filter = [
    [ 1, 0, -1],
    [ 1, 0, -1],
    [ 1, 0, -1]
]
new_mat = np.zeros((3,3))

s = 0

for i in range(3):
    for j in range(3):
        new_mat[i, j] = np.sum(mat[i:i+3, j:j+3] * filter)

print(new_mat)