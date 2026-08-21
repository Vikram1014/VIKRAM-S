using System;

namespace TunnelManagerService.Managers
{
    public class TunnelManager
    {
        public void StartTunnel(string interfaceName, string configPath)
        {
            // Placeholder: Call WireGuard executable to start tunnel
            Console.WriteLine($"[TunnelManager] Starting tunnel on interface {interfaceName} with config {configPath}");
        }

        public void StopTunnel(string interfaceName)
        {
            // Placeholder: Call WireGuard executable to stop tunnel
            Console.WriteLine($"[TunnelManager] Stopping tunnel on interface {interfaceName}");
        }
    }
}
