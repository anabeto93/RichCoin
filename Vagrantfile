# -*- mode: ruby -*-
# vi: set ft=ruby :


Vagrant.configure("2") do |config|
  

  config.vm.define "blockchain" do |blockchain|
    blockchain.vm.box = "ubuntu/xenial64"
    blockchain.vm.network "private_network", ip: "192.168.55.10"
    blockchain.vm.network :forwarded_port, guest: 22, host: 2222, id: "ssh", disabled: true
    blockchain.vm.network :forwarded_port, guest: 22, host: 2400, auto_correct: true
    blockchain.vm.network :forwarded_port, guest: 8000, host: 80, auto_correct: true
    blockchain.vm.hostname = "blockchain"
    blockchain.vm.synced_folder ".", "/vagrant", owner: "vagrant", group: "vagrant", mount_options:["dmode=775,fmode=775"]
    blockchain.vm.synced_folder ".", "/home/vagrant/Codes/JS", owner: "vagrant", group: "vagrant", mount_options:["dmode=775,fmode=777"]
    blockchain.vm.provider "virtualbox" do |vb|
      vb.customize ["modifyvm", :id, "--name", "blockchain"]
      vb.memory = "1024"
      vb.customize [ "modifyvm", :id, "--uartmode1", "disconnected" ]
    end

    blockchain.vm.provision "shell", inline: <<-SHELL
      sudo apt-get update -y
      sudo apt-get install software-properties-common -y
      sudo apt upgrade -y
      sudo apt install build-essential zlib1g-dev libncurses5-dev libgdbm-dev libnss3-dev libssl-dev libreadline-dev libffi-dev wget -y
      sudo add-apt-repository ppa:deadsnakes/ppa -y
      sudo apt update -y
      sudo apt upgrade -y
      sudo apt install python3.7 -y
      curl -sL https://deb.nodesource.com/setup_10.x -o nodesource_setup.sh
      sudo bash nodesource_setup.sh
      sudo apt install nodejs -y
      curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add - 
      echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
      sudo apt update
      sudo apt install yarn
    SHELL

    blockchain.vm.provision :shell, privileged: false do |s|
      ssh_pub_key = File.readlines("#{Dir.home}/.ssh/id_rsa.pub").first.strip
      s.inline = <<-SHELL
        echo #{ssh_pub_key} >> /home/$USER/.ssh/authorized_keys
        sudo bash -c "echo #{ssh_pub_key} >> /root/.ssh/authorized_keys"
      SHELL
    end
  end
end
