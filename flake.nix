{
  description = "Application packaged using poetry2nix";

  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-23.11";
    poetry2nix = {
      url = "github:nix-community/poetry2nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = inputs @ { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        # see https://github.com/nix-community/poetry2nix/tree/master#api for more functions and examples.
        pkgs = nixpkgs.legacyPackages.${system};
        # inherit (poetry2nix.lib.mkPoetry2Nix { inherit pkgs; }) mkPoetryApplication;
        poetry2nix = inputs.poetry2nix.lib.mkPoetry2Nix { inherit pkgs;};
      in
      {
        packages = {
          myapp = poetry2nix.mkPoetryApplication {
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
          };
          default = self.packages.${system}.myapp;
        };

        devShells.default = pkgs.mkShell {
          inputsFrom = [ self.packages.${system}.myapp ];
          packages = [ pkgs.poetry ];
        };
      });
}
