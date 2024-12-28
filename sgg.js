export default async function fetch_seeds(url, tok) {
    // https://www.start.gg/tournament/rhit-reverse-mains-tournament/event/ssbu-singles/brackets/1845867/2721899
    if (
        !/https:\/\/www.start.gg\/tournament\/[a-z\d\-]+\/event\/[a-z\d\-]+\/brackets\/\d+(\/\d+)?\/?$/.test(
            url
        )
    )
        return { error: "invalid url; it should end with brackets/xxxxxxx/xxxxxxx" };
    const query =
        "query PhaseSeeds($phaseId: ID!, $page: Int!, $perPage: Int!) {\nphase(id: $phaseId) {\nid\nseeds(query: { page: $page, perPage: $perPage }) {\npageInfo {\ntotal\ntotalPages\n}\nnodes {\nid\nseedNum\nentrant {\nid\nparticipants {\nid\ngamerTag\n}\n}\n}\n}\n}\n}";
    let phase = url.split("/")[8];
    let resp = await (
        await fetch("https://api.start.gg/gql/alpha", {
            method: "POST",
            headers: {
                Authorization: "Bearer " + tok,
            },
            body: JSON.stringify({
                query: query,
                variables: { phaseId: phase, page: "0", perPage: "100" }
            }),
        })
    ).json();
    if(!resp.data.phase.seeds) return {error: "request returned no data"};
    // this next line is EVIL
    return resp.data.phase.seeds.nodes.map(x => ({
        seed: x.seedNum,
        user: x.entrant.participants[0].gamerTag,
    }));
}