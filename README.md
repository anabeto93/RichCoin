# RichCoin

RichCoin is a VanillaJS project that is created as a proof of concept on how blockchain technology can be implemented.

## Setup 
For the purposes of testing, it is advised to use vagrant to setup the environment in order to run this project.

For those using windows subsystem for Linux, you can take a look at [Linux'izing your PC](https://cepa.io/2018/02/10/linuxizing-your-windows-pc-part1/) to prepare your development environment

## Installation
```bash 
vagrant up 
```

### Notes
You need a little patience while it is setup and also good internet connectivity

In my case, the source code is currently located at `/e/Codes/BlockChain/JS`, and thus you can setup a shortcut in your dev environment to easily access the VM

Add the below line to your [.bashrc](~/.bashrc) or [.bash_profile](~/.bash_profile) if on a Mac
```bash
function blockchain() {
         ( cd /e/Codes/BlockChain/vagrant && vagrant $* )
}
```

Afterwards, be sure to run the `source` command on it so that the changes take effect
```bash
source ~/.bashrc
```

To login to the VM, you can simply run `blockchain ssh`

## Usage


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)