#!/usr/bin/env python3
"""Scan the local network for devices using ARP requests."""

import sys
import socket
import subprocess
import re
from scapy.all import ARP, Ether, srp, conf


def get_local_subnet():
    """Detect the local subnet from the default interface."""
    try:
        ip = conf.route.route("0.0.0.0")[1]
        return re.sub(r"\.\d+$", ".0/24", ip)
    except Exception:
        return None


def resolve_hostname(ip):
    """Try to resolve a hostname for an IP address."""
    try:
        return socket.gethostbyaddr(ip)[0]
    except socket.herror:
        return None


def get_mac_vendor(mac):
    """Look up vendor from the system's OUI table if available."""
    try:
        result = subprocess.run(
            ["arp", "-a"], capture_output=True, text=True
        )
        # macOS arp output includes interface info but not vendor;
        # return None as a placeholder for future OUI lookup
        return None
    except Exception:
        return None


def get_mac_from_ip(ip):
    """Look up a MAC address for an IP from the system ARP table."""
    try:
        result = subprocess.run(["arp", "-n", ip], capture_output=True, text=True)
        match = re.search(r"([\da-f]{1,2}:){5}[\da-f]{1,2}", result.stdout, re.IGNORECASE)
        return match.group(0) if match else None
    except Exception:
        return None


def scan(subnet):
    """Send ARP requests and return a list of discovered devices."""
    packet = Ether(dst="ff:ff:ff:ff:ff:ff") / ARP(pdst=subnet)
    answered, _ = srp(packet, timeout=3, verbose=0)

    devices = []
    for sent, received in answered:
        hostname = resolve_hostname(received.psrc)
        devices.append({
            "ip": received.psrc,
            "mac": received.hwsrc,
            "hostname": hostname,
        })

    devices.sort(key=lambda d: tuple(int(p) for p in d["ip"].split(".")))
    return devices


def main():
    subnet = sys.argv[1] if len(sys.argv) > 1 else get_local_subnet()
    if not subnet:
        print("Could not detect subnet. Pass it as an argument: python scan.py 192.168.1.0/24")
        sys.exit(1)

    print(f"Scanning {subnet} ...\n")
    devices = scan(subnet)

    if not devices:
        print("No devices found.")
        return

    print(f"{'IP':<18} {'MAC':<20} {'Hostname'}")
    print("-" * 60)
    for d in devices:
        hostname = d["hostname"] or ""
        print(f"{d['ip']:<18} {d['mac']:<20} {hostname}")

    print(f"\n{len(devices)} device(s) found.")


if __name__ == "__main__":
    main()
