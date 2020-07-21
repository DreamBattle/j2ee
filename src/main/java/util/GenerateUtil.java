package util;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class GenerateUtil {

    /**
     * 获取模板信息
     *
     * @return 模板列表
     */
    public static List<String> getTemplates()
    {
        List<String> templates = new ArrayList<String>();
        templates.add("target/classes/template/Controller.vm");
        return templates;
    }

    /**
     * 目录不存在则生成目录
     * @param path
     */
    public static void createFile(String path) {
        File file = new File(path);
        file.mkdirs();
    }
}
