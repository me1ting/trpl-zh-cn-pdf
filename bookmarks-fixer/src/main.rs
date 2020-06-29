use std::{env, process};
use bookmarks_fixer::Config;

fn main() {
    let args: Vec<String> = env::args().collect();

    let config = Config::new(&args).unwrap_or_else(|err|{
        println!("{}", err);
        process::exit(1);
    });

    bookmarks_fixer::run(config);
}