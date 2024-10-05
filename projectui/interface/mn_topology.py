import sys
from mininet.net import Mininet
from mininet.node import OVSSwitch, RemoteController, Controller
from mininet.cli import CLI
import pandas as pd



# class RyuController(Controller):
#     def start(self):
#         self.popen('ryu-manager simple_switch.py', stdout=open('/tmp/ryu.log', 'w'), stderr=open('/tmp/ryu.err', 'w'))


def inject_sql_attack(target_host, dataset):
    # Simulate an SQL injection attack by modifying a specific host's data
    attack_command = "'; DROP TABLE SensorData; --"  # Example SQL injection payload

    # Modify the dataset to simulate the SQL injection
    if target_host in dataset.columns:
        # Cast the target column to string type before inserting the SQL injection
        dataset[target_host] = dataset[target_host].astype(str)
        # Check if the values are non-empty or non-null
        dataset.loc[dataset[target_host].notna() & (dataset[target_host] != ''), target_host] = attack_command
        print(f"SQL injection attack simulated on host {target_host}")

def create_topology(dataset, file_path):
    net = Mininet(controller=None, switch=OVSSwitch)

    # Add switches
    s1 = net.addSwitch('s1')

    # Add hosts (representing sensors and actuators)
    sensors = ['FIT101', 'LIT101', 'AIT201', 'AIT202', 'AIT203', 'FIT201', 'FIT301', 'LIT301', 'AIT401', 'AIT402']
    actuators = ['MV101', 'P101', 'P102', 'MV201', 'P201', 'P202', 'P203', 'P204', 'P205', 'P206', 'MV301', 'MV302', 'MV303', 'MV304', 'P301', 'P302', 'P401', 'P402', 'P403', 'P404']
    
    for sensor in sensors:
        net.addHost(sensor)
    for actuator in actuators:
        net.addHost(actuator)

    # Connect hosts to switches
    for sensor in sensors:
        net.addLink(sensor, s1)
    for actuator in actuators:
        net.addLink(actuator, s1)

    # Start Mininet
    net.start()

    # Start the controller (POX)
    c0 = net.addController('c0', controller=RemoteController, ip='127.0.0.1', port=6633)
    # Not using RYU controller
    # c0 = net.addController('c0', controller=RyuController)
    c0.start()

    # Assign controller to the switch
    s1.start([c0])

    # Define target host for the SQL injection
    target_host = "FIT101"  # You can change this to the actual target

    print(f"Injecting SQL attack on host {target_host}...")
    
    # Perform SQL injection attack simulation
    inject_sql_attack(target_host, dataset)

    # Modify the dataset (simulating the attack)
    dataset.loc[dataset['FIT101'] > 0, 'FIT101'] = "'; DROP TABLE SensorData; --"  # Example SQL injection
    
    # Save the modified dataset
    modified_file_path = 'modified_' + file_path.split('/')[-1]
    dataset.to_csv(modified_file_path, index=False)
    print(f"Modified dataset saved to {modified_file_path}")

    # Start the CLI
    CLI(net)

    # Stop Mininet
    net.stop()

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python your_python_script.py <dataset_file_path>")
        sys.exit(1)

    file_path = sys.argv[1]

    # Read the CSV file skipping the first row
    dataset = pd.read_csv(file_path, skiprows=1)

    # Set column names
    dataset.columns = ['Timestamp', 'FIT101', 'LIT101', 'MV101', 'P101', 'P102', 'AIT201', 'AIT202', 'AIT203',
                       'FIT201', 'MV201', 'P201', 'P202', 'P203', 'P204', 'P205', 'P206', 'DPIT301', 'FIT301',
                       'LIT301', 'MV301', 'MV302', 'MV303', 'MV304', 'P301', 'P302', 'AIT401', 'AIT402', 'FIT401',
                       'LIT401', 'P401', 'P402', 'P403', 'P404', 'UV401', 'AIT501', 'AIT502', 'AIT503', 'AIT504',
                       'FIT501', 'FIT502', 'FIT503', 'FIT504', 'P501', 'P502', 'PIT501', 'PIT502', 'PIT503',
                       'FIT601', 'P601', 'P602', 'P603', 'Normal/Attack']

    # Create topology and simulate SQL injection attack
    create_topology(dataset, file_path)
