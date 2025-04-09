{ pkgs ? import <nixpkgs> {} }:

with pkgs;

let
  nodejs = nodejs-18_x;
  npm = nodejs.pkgs.npm;
in

{
  buildInputs = [
    nodejs
    npm
  ];

  shellHook = ''
    export PATH="$PWD/node_modules/.bin:$PATH"
  '';
} 