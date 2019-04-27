#!/usr/bin/env bash

rm_check() {
    if ls *."${1}" 1> /dev/null 2>&1; then
        rm *."${1}"
        echo "All *.${1} files have been deleted"
    else
        echo "No *.${1} files were found"
    fi
}

read -p "are you sure you want to delete the files? Y/N " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm_check log
    rm_check toc 
    rm_check aux
    rm_check glo
    rm_check ist
    rm_check out
    rm_check synctex.gz
fi