package util;

import java.text.MessageFormat;
import java.util.PropertyResourceBundle;
import java.util.ResourceBundle;
/**
* 通过 java.util.ResourceBundle 类读取配置文件
* @author WayneChou
*    需要传入文件名称
*/
public class ReadProperties {
    private PropertyResourceBundle properTyResourceBundle;

    public ReadProperties(String fileName) {
        properTyResourceBundle = (PropertyResourceBundle) ResourceBundle
                .getBundle(fileName);
    }

    /**
     * 根据key获得对应的value
     *
     * @param strPropertyName
     *            key
     * @return String
     */
    public String getString(String strPropertyName) {
        try {
            return properTyResourceBundle.getString(strPropertyName);
        } catch (Exception e) {
            return strPropertyName;
        }
    }

    public String getString(String strPropertyName, Object... obj) {
        String str = properTyResourceBundle.getString(strPropertyName);
        if (str == null) {
            return strPropertyName;
        }
        return MessageFormat.format(str, obj);
    }

    public PropertyResourceBundle getBundle() {
        return properTyResourceBundle;
    }

    public static void main(String[] args) {
        System.out.println("项目启动");
        ReadProperties readSysMessage = new ReadProperties("generate");
        System.out.println(readSysMessage.getString("url"));
    }

}