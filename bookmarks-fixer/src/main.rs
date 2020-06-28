use serde::Deserialize;
use std::env;
use std::fs::File;
use std::io::{BufReader, Read, Write};
use std::process::Command;

#[derive(Deserialize)]
struct Bookmark {
    level: i32,
    title: String,
    page_num: i32,
}

// 读取tampermonkey生成的书签
fn read_bookmarks(filename: &str) -> Vec<Bookmark> {
    let file = File::open(filename).expect(format!("read file {} error", filename).as_str());
    let mut buf_reader = BufReader::new(file);
    let mut contents = String::new();
    buf_reader.read_to_string(&mut contents).expect("read bookmarks from file error");

    let bookmarks: Vec<Bookmark> = serde_json::from_str(contents.as_str()).expect("parse json error");

    return bookmarks;
}

// 保存书签为PdgCntEditor支持的格式
fn save_bookmarks(bookmarks: Vec<Bookmark>, filename: &str) {
    //这些标签不需要序号
    let no_prefix_titles = vec!["Rust 程序设计语言", "前言", "介绍"];

    let mut content = String::new();


    let mut no_prefix = false;
    let mut top_index = 0;
    let mut second_index = 0;
    for bookmark in bookmarks {
        let mut prefix = String::from("");
        if bookmark.level == 1 {
            if no_prefix_titles.contains(&bookmark.title.as_str()) {
                no_prefix = true;
            } else {
                no_prefix = false;
                top_index += 1;
                second_index = 0;
                prefix.push_str(&top_index.to_string());
                prefix.push_str(". ");
            }
        } else if bookmark.level == 2 {
            second_index += 1;
            if !no_prefix {
                prefix.push_str(&top_index.to_string());
                prefix.push_str(".");
                prefix.push_str(&second_index.to_string());
                prefix.push_str(". ");
            }
        }
        write(&mut content, &bookmark, &prefix);
    }

    let mut file = File::create(filename).expect("create saved file error");
    file.write_all(content.as_bytes()).expect("write saved file error");
}

fn write(builder: &mut String, bookmark: &Bookmark, prefix: &str) {
    if bookmark.level == 2 {
        builder.push_str("\t");
    } else if bookmark.level == 3 {
        builder.push_str("\t\t");
    }

    builder.push_str(prefix);
    builder.push_str(&bookmark.title);

    builder.push_str("\t");
    builder.push_str(&bookmark.page_num.to_string());
    builder.push_str("\r\n");
}

fn fix_all(bookmarks: &mut Vec<Bookmark>, pdf: &str) {
    let mut offset = 0;// 预估偏移量
    for bookmark in bookmarks {
        offset = fix(bookmark, pdf, offset);
    }
}

// 预估生成的页码位置不完全正确，需要修复，返回当前标题的实际偏移量，供下个书签修复使用
fn fix(bookmark: &mut Bookmark, pdf: &str, offset: i32) -> i32 {
    let query_result = query(pdf, bookmark.page_num + offset, &bookmark.title, bookmark.level);
    return match query_result {
        QueryResult::Found(i) => {
            let old_page_num = bookmark.page_num;
            bookmark.page_num = i;
            i - old_page_num
        }
        QueryResult::Multi(s) => {
            println!("mutli result of `{},{}` are `{}`, please fix it by hand", bookmark.title, bookmark.level, s);
            offset
        }
        QueryResult::NotFound => {
            println!("no result of `{},{}`, please fix it by hand", bookmark.title, bookmark.level);
            offset
        }
    }
}

enum QueryResult {
    Found(i32),
    Multi(String),
    NotFound,
}

fn query(pdf: &str, page_num: i32, str: &str, level: i32) -> QueryResult {
    let output = Command::new("mutool")
        .args(&["run", "search.js", pdf, &page_num.to_string(), &str, &level.to_string()])
        .output()
        .expect("failed to execute mutool");
    let result = output.stdout;
    let result_str = String::from_utf8(result).expect("failed to read mutool result");
    let result_str = result_str.trim();
    return if result_str.len() == 0 {
        QueryResult::NotFound
    } else if result_str.contains(",") {
        QueryResult::Multi(result_str.to_string())
    } else {
        QueryResult::Found(result_str.parse().unwrap())
    };
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 3 {
        println!("Usage: bookmarks-fixer input.pdf bookmarks.txt");
        return;
    }

    let pdf_filename = &args[1];
    let bookmarks_filename = &args[2];

    let mut bookmarks = read_bookmarks(bookmarks_filename);
    fix_all(&mut bookmarks, pdf_filename);
    let saved_name = String::from(bookmarks_filename) + ".fixed";
    save_bookmarks(bookmarks, &saved_name);
}
