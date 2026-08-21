using System;

namespace TunnelManagerService.Managers
{
    public class NATManager
    {
        public void EnableInternetSharing(string publicInterface, string privateInterface)
        {
            // Placeholder: Enable Windows ICS or NAT
            Console.WriteLine($"[NATManager] Enabling NAT from {privateInterface} to {publicInterface}");
        }
    }
}
