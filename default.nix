{ pkgs ? import <nixpkgs> {} }:
let
  poetry2nix = import (fetchTarball https://github.com/nix-community/poetry2nix/archive/refs/tags/2024.2.1747494.tar.gz) { };
in
  poetry2nix.mkPoetryApplication {
    projectDir = ./.;
  
    overrides = poetry2nix.overrides.withDefaults (self: super: {
      helium = super.helium.overridePythonAttrs(oldAttrs: {
        buildInputs = (oldAttrs.buildInputs or [ ])
        ++ [ super.setuptools ];
        });
      });

    postFixup = ''
      wrapProgram $out/bin/r7placebot --prefix PATH : ${pkgs.lib.makeBinPath ( with pkgs; [ chromium chromedriver ])}
    '';
  }
