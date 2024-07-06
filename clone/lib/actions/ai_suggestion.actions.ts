"use server"

export async function getSuggestion({
    image,
}: {
    image: string,
}) {
    const res = await fetch("http://localhost:8000/predict/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"  // Specify JSON content type
        },
        body: JSON.stringify({
            file: image,
        })
    })
    console.log(res)
    let data = await res.json()
    data = data.predictions

    return {
        hasgtags: data.hashtags,
        // captions: data.preds,
    }
}

export async function getCaptions({
    text
}: {
    text: string
}) {
    const res = await fetch("https://62c9-34-127-113-205.ngrok-free.app/captions/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"  // Specify JSON content type
        },
        body: JSON.stringify({
            text: text,
        })
    })

    let data = await res.json()

    return data
}

