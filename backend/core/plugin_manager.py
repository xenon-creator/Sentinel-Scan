from typing import Dict, List, Optional, Type
from backend.plugins.base import ScannerPlugin, ScanResult
from backend.plugins.nmap_scanner import NmapScanner

class PluginManager:

    def __init__(self):
        self.plugins: Dict[str, ScannerPlugin] = {}
        self._register_builtin_plugins()

    def _register_builtin_plugins(self):
        self.register_plugin(NmapScanner)

    def register_plugin(self, plugin_class: Type[ScannerPlugin], config: Optional[Dict]=None):
        try:
            plugin_instance = plugin_class(config)
            self.plugins[plugin_instance.name] = plugin_instance
            print(f'✅ Registered plugin: {plugin_instance.name} v{plugin_instance.version}')
        except Exception as e:
            print(f'❌ Failed to register plugin {plugin_class.__name__}: {e}')

    async def initialize_plugin(self, plugin_name: str) -> bool:
        if plugin_name not in self.plugins:
            print(f'❌ Plugin not found: {plugin_name}')
            return False
        plugin = self.plugins[plugin_name]
        if plugin.initialized:
            return True
        return await plugin.initialize()

    async def initialize_all_plugins(self):
        for plugin_name in self.plugins:
            await self.initialize_plugin(plugin_name)

    async def execute_scan(self, plugin_name: str, target: str, options: Optional[Dict]=None) -> ScanResult:
        if plugin_name not in self.plugins:
            return ScanResult(scanner_name=plugin_name, target=target, status='failed', findings=[], error_message=f"Plugin '{plugin_name}' not found")
        plugin = self.plugins[plugin_name]
        if not plugin.initialized:
            init_success = await self.initialize_plugin(plugin_name)
            if not init_success:
                return ScanResult(scanner_name=plugin_name, target=target, status='failed', findings=[], error_message=f"Failed to initialize plugin '{plugin_name}'")
        if not plugin.validate_target(target):
            return ScanResult(scanner_name=plugin_name, target=target, status='failed', findings=[], error_message=f"Invalid target for plugin '{plugin_name}'")
        try:
            result = await plugin.scan(target, options)
            return result
        except Exception as e:
            return ScanResult(scanner_name=plugin_name, target=target, status='failed', findings=[], error_message=f'Scan execution failed: {str(e)}')

    def get_plugin(self, plugin_name: str) -> Optional[ScannerPlugin]:
        return self.plugins.get(plugin_name)

    def list_plugins(self) -> List[Dict]:
        return [plugin.get_info() for plugin in self.plugins.values()]

    def get_plugins_for_scan_type(self, scan_type: str) -> List[str]:
        scan_type_map = {'network': ['nmap'], 'vulnerability': ['nuclei'], 'web': ['zap'], 'container': ['trivy'], 'secrets': ['trufflehog'], 'iac': ['checkov'], 'cloud': ['scoutsuite']}
        return scan_type_map.get(scan_type, [])
plugin_manager = PluginManager()