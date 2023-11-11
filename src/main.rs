use std::net::SocketAddr;
use std::convert::Infallible;
use hyper::{Server, Request, Response, Body};
use hyper::service::{service_fn, make_service_fn};

async fn handle_request(request : Request<Body>) -> Result<Response<Body>, Infallible> {
    Ok(Response::new("Hello!".into()))
}

#[tokio::main]
async fn main() {
    let socket_addr = SocketAddr::from(([127, 0, 0, 1], 3090));
    
    let make_callback = make_service_fn(|_connection| async {
        Ok::<_, Infallible>(service_fn(handle_request))
    });

    let server = Server::bind(&socket_addr).serve(make_callback);

    if let Err(e) = server.await {
        eprintln!("Server error: {e}");
    }
}
