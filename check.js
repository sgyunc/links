export const config = {
    runtime: 'edge',
};

export default async function handler(request) {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');
    if(!targetUrl){
        return new Response(JSON.stringify({ok:false}), {
            headers:{"content-type":"application/json","Access-Control-Allow-Origin":"*"}
        })
    }
    try{
        const controller = new AbortController();
        const timeoutId = setTimeout(()=>controller.abort(),6000);
        const res = await fetch(targetUrl,{
            method:"HEAD",
            signal:controller.signal,
            headers:{
                "User-Agent":"Mozilla/5.0 LinkChecker"
            }
        });
        clearTimeout(timeoutId);
        const ok = res.status >=200 && res.status <300;
        return new Response(JSON.stringify({ok}),{
            headers:{"content-type":"application/json","Access-Control-Allow-Origin":"*"}
        })
    }catch(e){
        return new Response(JSON.stringify({ok:false}),{
            headers:{"content-type":"application/json","Access-Control-Allow-Origin":"*"}
        })
    }
}
